from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import tempfile
from ..crews.classifier_crew import ClassifierCrew

# Create router for classification endpoints
router = APIRouter()
classifier_crew = ClassifierCrew()

# --- Pydantic models ---
class TextClassificationRequest(BaseModel):
    text_description: str

class ClassificationResponse(BaseModel):
    category: str
    confidence: Optional[float] = None


# --- Endpoints ---

@router.post(
    "/text",
    response_model=ClassificationResponse,
    summary="Classify waste from text",
    description="Classify a waste item based on a text description using CrewAI."
)
async def classify_from_text(request: TextClassificationRequest):
    """
    Classify waste category from a text description.
    Example: "plastic bottle", "banana peel"
    """
    try:
        if not request.text_description or request.text_description.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="Text description cannot be empty"
            )

        text_input = request.text_description.strip()
        category = classifier_crew.classify(input_data=text_input, is_image=False)

        return ClassificationResponse(category=category)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Text classification failed: {str(e)}"
        )


@router.post(
    "/image",
    response_model=ClassificationResponse,
    summary="Classify waste from image",
    description="Upload an image of a waste item for classification using CrewAI."
)
async def classify_from_image(file: UploadFile = File(...)):
    """
    Classify waste category from an uploaded image.
    Example: JPEG or PNG of plastic, fruit peel, battery, etc.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (JPEG, PNG, etc.)"
        )

    temp_file_path = None
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Classify using CrewAI
        category = classifier_crew.classify(input_data=temp_file_path, is_image=True)

        return ClassificationResponse(category=category)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Image classification failed: {str(e)}"
        )
    finally:
        # Always clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except:
                pass
