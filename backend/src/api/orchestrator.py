# backend/src/api/orchestrator.py
import sys, os
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict, Optional
import tempfile
from fastapi import Query

from src.crews.orchestrator_crew import OrchestratorCrew

# Initialize router and orchestrator
router = APIRouter()
orchestrator = OrchestratorCrew()


class OrchestratorRequest(BaseModel):
    """Generic orchestrator request model for JSON-based tasks"""
    task: str
    need: Optional[list[str]] = None
    payload: Optional[Dict] = None


@router.post("/handle")
async def orchestrate(request: OrchestratorRequest):
    """
    Main orchestrator endpoint.
    Handles all JSON-based tasks:
      - classify_text
      - recycle
      - awareness
      - quiz
      - end_to_end
    """
    try:
        result = orchestrator.handle_task(
            request.task,
            request.payload or {},
            needs=request.need
        )

        # Unified error handling
        if "error_type" in result:
            error_type = result["error_type"]
            if error_type == "ValidationError":
                raise HTTPException(status_code=400, detail=result)
            elif error_type == "UnknownTask":
                raise HTTPException(status_code=404, detail=result)
            else:
                raise HTTPException(status_code=500, detail=result)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})




@router.post("/handle/image")
async def orchestrate_image(
    file: UploadFile = File(...),
    location: Optional[str] = Query(None, description="Optional user location"),
    needs: Optional[str] = Query(None, description="Comma-separated list of agents: guide,awareness,quiz")
):
    """
    Orchestrator endpoint for image input.
    Always classifies first, then runs additional agents based on 'needs'.
    Example: ?needs=guide,awareness
    """
    temp_file_path = None
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Step 1: Always classify
        classification_result = orchestrator.handle_task("classify_image", {"image_path": temp_file_path})
        if not classification_result.get("steps"):
            return {"error_type": "ClassificationError", "detail": "Could not classify image"}

        classification = classification_result["steps"][0]["output"]

        # Step 2: Decide which agents to run
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

        return {"task": "classify_image", "steps": steps}

    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
