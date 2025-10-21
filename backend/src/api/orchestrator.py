import os, tempfile
from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Depends
from pydantic import BaseModel
from typing import Dict, Optional, Any

# ✅ Clerk + MongoDB integration
from src.utils.auth import verify_clerk_token
from src.db import users_collection

# ✅ Agent orchestrator
from src.crews.orchestrator_crew import OrchestratorCrew

# Initialize router and orchestrator
router = APIRouter()
orchestrator = OrchestratorCrew()


# -------------------- MODELS --------------------
class OrchestratorRequest(BaseModel):
    """Generic orchestrator request model for JSON-based tasks"""
    task: str
    need: Optional[list[str]] = None
    payload: Optional[Dict] = None


class QuizAnswerRequest(BaseModel):
    """Model for quiz answer submission"""
    quiz_data: Dict[str, Any]
    selected_answer: str


# -------------------- TEXT / CUSTOM TASK HANDLER --------------------
@router.post("/handle")
async def orchestrate(request: OrchestratorRequest, user=Depends(verify_clerk_token)):
    print("📩 Received body:", request)
    """
    Handles all text-based or custom orchestrations.
    Supports classify_text, recycle, awareness, quiz, and custom chains.
    """
    try:
        result = orchestrator.handle_task(
            request.task,
            request.payload or {},
            needs=request.need
        )

        # --- Unified error handling ---
        if "error_type" in result:
            error_type = result["error_type"]
            if error_type == "ValidationError":
                raise HTTPException(status_code=400, detail=result)
            elif error_type == "UnknownTask":
                # ✅ fallback: treat as classification request
                fallback_payload = request.payload or {}
                category = fallback_payload.get("item") or fallback_payload.get("text")
                classification = orchestrator.handle_task(
                    "classify_text", {"item": category}, needs=["classify"]
                )
                result = {
                    "task": "fallback_classification",
                    "steps": classification.get("steps", [])
                }
            else:
                raise HTTPException(status_code=500, detail=result)

        # ✅ Save to MongoDB
        users_collection.update_one(
            {"clerk_id": user["id"]},
            {
                "$push": {"history": {"type": request.task, "output": result}},
                "$inc": {"points": 3}  # base reward for each text task
            },
            upsert=True
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})


# -------------------- IMAGE HANDLER --------------------
@router.post("/handle/image")
async def orchestrate_image(
    file: UploadFile = File(...),
    location: Optional[str] = Query(None, description="Optional user location"),
    needs: Optional[str] = Query(None, description="Comma-separated list of agents: guide,awareness,quiz"),
    user=Depends(verify_clerk_token)
):
    """
    Handles image-based classification and optional awareness/recycling/quiz.
    """
    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        classification_result = orchestrator.handle_task("classify_image", {"image_path": temp_file_path})
        if not classification_result.get("steps"):
            return {"error_type": "ClassificationError", "detail": "Could not classify image"}

        classification = classification_result["steps"][0]["output"]

        needs_list = [n.strip().lower() for n in needs.split(",")] if needs else ["guide", "awareness"]
        steps = [{"agent": "classifier", "output": classification}]

        if "guide" in needs_list or "recycle" in needs_list:
            guide = orchestrator.handle_task("recycle", {"waste_category": classification, "location": location})
            steps.append({"agent": "recycling", "output": guide["steps"][0]["output"]})

        if "awareness" in needs_list:
            tip = orchestrator.handle_task("awareness", {"context": f"Image classified as {classification}"})
            steps.append({"agent": "awareness", "output": tip["steps"][0]["output"]})

        if "quiz" in needs_list:
            quiz = orchestrator.handle_task("quiz", {"topic": classification})
            steps.append({"agent": "quiz", "output": quiz["steps"][0]["output"]})

        response = {"task": "classify_image", "steps": steps}

        # ✅ Save classification and award points
        users_collection.update_one(
            {"clerk_id": user["id"]},
            {
                "$push": {
                    "history": {
                        "type": "image_classification",
                        "classification": classification,
                        "details": response
                    }
                },
                "$inc": {"points": 5}  # +5 points per image classification
            },
            upsert=True
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)


# -------------------- QUIZ VALIDATION --------------------
@router.post("/quiz/answer")
async def handle_quiz_answer(request: QuizAnswerRequest, user=Depends(verify_clerk_token)):
    """Validates quiz answers and rewards correct responses."""
    try:
        quiz_data = request.quiz_data
        selected_answer = request.selected_answer

        correct_answer = quiz_data.get("correct_answer", "")
        explanation = quiz_data.get("explanation", "")
        question = quiz_data.get("question", "")
        is_correct = selected_answer.strip().upper() == correct_answer.strip().upper()

        # ✅ Reward points if correct
        if is_correct:
            users_collection.update_one(
                {"clerk_id": user["id"]},
                {"$inc": {"points": 10}},
                upsert=True
            )

        # ✅ Save attempt history
        users_collection.update_one(
            {"clerk_id": user["id"]},
            {"$push": {
                "history": {
                    "type": "quiz_attempt",
                    "question": question,
                    "selected_answer": selected_answer,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct,
                    "explanation": explanation
                }
            }},
            upsert=True
        )

        return {
            "task": "quiz_answer_validation",
            "steps": [
                {
                    "agent": "quiz_validator",
                    "output": {
                        "is_correct": is_correct,
                        "selected_answer": selected_answer,
                        "correct_answer": correct_answer,
                        "explanation": explanation,
                        "question": question
                    }
                }
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})
