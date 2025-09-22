# backend/src/api/orchestrator.py
import sys, os
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict, Optional
import tempfile

from src.crews.orchestrator_crew import OrchestratorCrew

# Initialize router and orchestrator
router = APIRouter()
orchestrator = OrchestratorCrew()


class OrchestratorRequest(BaseModel):
    """Generic orchestrator request model for JSON-based tasks"""
    task: str
    payload: Optional[Dict] = None


@router.post("/orchestrate")
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
        result = orchestrator.handle_task(request.task, request.payload or {})
        if "error" in result:
            raise HTTPException(status_code=400, detail=result)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})


@router.post("/orchestrate/image")
async def orchestrate_image(file: UploadFile = File(...), location: Optional[str] = None):
    """
    Orchestrator endpoint for image input.
    Multi-agent chain:
      1. Classify the image
      2. Generate recycling guide
      3. Generate awareness tip
    """
    temp_file_path = None
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Step 1: classify image
        result = orchestrator.handle_task("classify_image", {"image_path": temp_file_path})

        # Step 2 + 3: chain recycling and awareness
        if "classification" in result:
            classification = result["classification"]

            # Recycling guide
            guide = orchestrator.handle_task(
                "recycle", {"waste_category": classification, "location": location}
            )

            # Awareness tip
            tip = orchestrator.handle_task(
                "awareness", {"context": f"Image classified as {classification}"}
            )

            # Merge results
            result.update(guide)
            result.update(tip)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})
    finally:
        # Always clean up the temp file
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
