import os, tempfile, traceback
from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Depends
from pydantic import BaseModel
from typing import Dict, Optional, Any

# ✅ Clerk + MongoDB integration
from ..utils.auth import verify_clerk_token
from ..db import users_collection

# ✅ Agent orchestrator
from ..crews.orchestrator_crew import OrchestratorCrew

# ✅ Memory manager for chat context
from ..utils.memory_manager import MemoryManager

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
    # Sanity check: ensure user is valid (helps turn internal KeyError into 401)
    if not isinstance(user, dict) or not user.get("id"):
        print("❌ Invalid user from verify_clerk_token:", user)
        raise HTTPException(status_code=401, detail="Invalid or missing user authentication")
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

        # ✅ Save recycling guide to chat memory if present in result
        try:
            recycling_step = next((step for step in result.get("steps", []) if step.get("agent") == "recycling"), None)
            classifier_step = next((step for step in result.get("steps", []) if step.get("agent") == "classifier"), None)

            if recycling_step and classifier_step:
                MemoryManager.save_context(
                    user_id=user["id"],
                    user_message=f"Classified waste item: {classifier_step.get('output', 'unknown')}",
                    assistant_response="Here's how to recycle this item.",
                    recycling_guide=recycling_step.get("output")
                )
                print(f"✅ Saved recycling guide to chat memory for user {user['id']}")
        except Exception as mem_err:
            print(f"⚠️ Failed to save to chat memory: {mem_err}")

        # ✅ Save to MongoDB (non-fatal: log DB errors but don't crash endpoint)
        try:
            users_collection.update_one(
                {"clerk_id": user["id"]},
                {
                    "$push": {"history": {"type": request.task, "output": result}},
                    "$inc": {"points": 3}  # base reward for each text task
                },
                upsert=True
            )
        except Exception as db_err:
            print(f"⚠️ MongoDB update failed in /handle: {db_err}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        print(f"❌ Exception in /handle: {e}\n{tb}")
        # Return a limited traceback to clients for debugging in development
        raise HTTPException(status_code=500, detail={"error": str(e), "trace": tb[:2000]})


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
    # Sanity check: ensure user is valid
    if not isinstance(user, dict) or not user.get("id"):
        print("❌ Invalid user from verify_clerk_token in /handle/image:", user)
        raise HTTPException(status_code=401, detail="Invalid or missing user authentication")
    try:
        # ensure filename has an extension; fallback to jpg
        filename = getattr(file, "filename", None) or "upload.jpg"
        ext = filename.split(".")[-1] if "." in filename else "jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        classification_result = orchestrator.handle_task("classify_image", {"image_path": temp_file_path})
        if not classification_result.get("steps"):
            return {"error_type": "ClassificationError", "detail": "Could not classify image"}

        classification = classification_result["steps"][0]["output"]

        needs_list = [n.strip().lower() for n in needs.split(",")] if needs else ["guide", "awareness"]
        steps = [{"agent": "classifier", "output": classification}]

        recycling_guide_text = None
        if "guide" in needs_list or "recycle" in needs_list:
            guide = orchestrator.handle_task("recycle", {"waste_category": classification, "location": location})
            recycling_guide_text = guide["steps"][0]["output"]
            steps.append({"agent": "recycling", "output": recycling_guide_text})

        if "awareness" in needs_list:
            tip = orchestrator.handle_task("awareness", {"context": f"Image classified as {classification}"})
            steps.append({"agent": "awareness", "output": tip["steps"][0]["output"]})

        if "quiz" in needs_list:
            quiz = orchestrator.handle_task("quiz", {"topic": classification})
            if quiz.get("steps") and len(quiz["steps"]) > 0:
                steps.append({"agent": "quiz", "output": quiz["steps"][0]["output"]})
            else:
                # Fallback if quiz doesn't have expected structure
                steps.append({"agent": "quiz", "output": quiz.get("output", "Quiz generation failed")})

        response = {"task": "classify_image", "steps": steps}

        # ✅ Save recycling guide to chat memory for Chat Assistant context
        if recycling_guide_text:
            try:
                MemoryManager.save_context(
                    user_id=user["id"],
                    user_message=f"Classified waste item: {classification}",
                    assistant_response=f"Here's how to recycle this item.",
                    recycling_guide=recycling_guide_text
                )
                print(f"✅ Saved recycling guide to chat memory for user {user['id']}")
            except Exception as mem_err:
                print(f"⚠️ Failed to save to chat memory: {mem_err}")

        # ✅ Save classification and award points (non-fatal DB ops)
        try:
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
        except Exception as db_err:
            print(f"⚠️ MongoDB update failed in /handle/image: {db_err}")

        return response

    except Exception as e:
        tb = traceback.format_exc()
        print(f"❌ Exception in /handle/image: {e}\n{tb}")
        raise HTTPException(status_code=500, detail={"error": str(e), "trace": tb[:2000]})
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass


# -------------------- QUIZ VALIDATION --------------------
@router.post("/quiz/answer")
async def handle_quiz_answer(request: QuizAnswerRequest, user=Depends(verify_clerk_token)):
    """Validates quiz answers and rewards correct responses."""
    # Sanity check: ensure user is valid
    if not isinstance(user, dict) or not user.get("id"):
        print("❌ Invalid user from verify_clerk_token in /quiz/answer:", user)
        raise HTTPException(status_code=401, detail="Invalid or missing user authentication")
    try:
        quiz_data = request.quiz_data
        selected_answer = request.selected_answer

        correct_answer = quiz_data.get("correct_answer", "")
        explanation = quiz_data.get("explanation", "")
        question = quiz_data.get("question", "")
        is_correct = selected_answer.strip().upper() == correct_answer.strip().upper()

        # ✅ Reward points if correct
        if is_correct:
            try:
                users_collection.update_one(
                    {"clerk_id": user["id"]},
                    {"$inc": {"points": 10}},
                    upsert=True
                )
            except Exception as db_err:
                print(f"⚠️ MongoDB update failed in /quiz/answer (points): {db_err}")

        # ✅ Save attempt history (non-fatal DB op)
        try:
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
        except Exception as db_err:
            print(f"⚠️ MongoDB update failed in /quiz/answer (history): {db_err}")

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
        tb = traceback.format_exc()
        print(f"❌ Exception in /quiz/answer: {e}\n{tb}")
        raise HTTPException(status_code=500, detail={"error": str(e), "trace": tb[:2000]})
