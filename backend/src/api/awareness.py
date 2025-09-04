import sys
import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional

# Add the correct path to Python path
current_file = os.path.abspath(__file__)
backend_src_path = os.path.dirname(os.path.dirname(os.path.dirname(current_file)))
sys.path.insert(0, backend_src_path)

print(f"🔧 Added to Python path: {backend_src_path}")

# Import after path setup
try:
    from src.models.response_models import ErrorResponse

    print("✅ Imported ErrorResponse successfully")
except ImportError as e:
    print(f"❌ Could not import ErrorResponse: {e}")


    class ErrorResponse(BaseModel):
        error_type: str
        detail: str

try:
    from src.crews.awareness_crew import AwarenessCrew

    print("✅ Imported AwarenessCrew successfully")
except ImportError as e:
    print(f"❌ Could not import AwarenessCrew: {e}")
    # Fallback crew would be defined here...


# Request models
class AwarenessRequest(BaseModel):
    context: str
    user_id: Optional[str] = None


class QuizRequest(BaseModel):
    topic: str
    difficulty: Optional[str] = "medium"


# Response models
class AwarenessResponse(BaseModel):
    message: str
    context: str
    message_type: str = "awareness_tip"


class QuizResponse(BaseModel):
    question: str
    options: Dict[str, str]
    correct_answer: str
    explanation: str
    topic: str


# Create router
router = APIRouter()

# Initialize crew lazily
_awareness_crew = None


def get_awareness_crew():
    global _awareness_crew
    if _awareness_crew is None:
        try:
            _awareness_crew = AwarenessCrew()
            print("✅ Awareness crew initialized successfully!")
        except Exception as e:
            print(f"❌ Crew initialization failed: {e}")
            # Fallback implementation...
    return _awareness_crew


@router.post("/tip",
             response_model=AwarenessResponse,
             responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
             summary="Get awareness tip",
             description="Returns a motivational and educational tip about waste management based on context")
async def get_awareness_tip(request: AwarenessRequest):
    try:
        if not request.context or request.context.strip() == "":
            raise HTTPException(status_code=400,
                                detail={"error_type": "ValidationError", "detail": "Context cannot be empty"})

        context = request.context.strip()
        crew = get_awareness_crew()
        message = crew.get_awareness_tip(context)

        return AwarenessResponse(
            message=message,
            context=context,
            message_type="awareness_tip"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_type": "InternalServerError",
                                                     "detail": f"Failed to generate awareness tip: {str(e)}"})


@router.post("/quiz",
             response_model=QuizResponse,
             responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
             summary="Get quiz question",
             description="Returns a quiz question on waste management topics in JSON format")
async def get_quiz_question(request: QuizRequest):
    try:
        if not request.topic or request.topic.strip() == "":
            raise HTTPException(status_code=400,
                                detail={"error_type": "ValidationError", "detail": "Topic cannot be empty"})

        topic = request.topic.strip()
        crew = get_awareness_crew()
        quiz_json = crew.get_quiz_question(topic)

        # Parse the JSON response
        try:
            quiz_data = json.loads(quiz_json)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail={"error_type": "JSONParseError",
                                                         "detail": f"Failed to parse quiz response: {str(e)}"})

        return QuizResponse(
            question=quiz_data.get("question", ""),
            options=quiz_data.get("options", {}),
            correct_answer=quiz_data.get("correct_answer", ""),
            explanation=quiz_data.get("explanation", ""),
            topic=topic
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_type": "InternalServerError",
                                                     "detail": f"Failed to generate quiz question: {str(e)}"})


# GET endpoints for quick testing
@router.get("/tip/{context}", response_model=AwarenessResponse, summary="Quick awareness tip (GET)")
async def get_awareness_tip_quick(context: str):
    try:
        if not context or context.strip() == "":
            raise HTTPException(status_code=400,
                                detail={"error_type": "ValidationError", "detail": "Context cannot be empty"})

        context = context.strip()
        crew = get_awareness_crew()
        message = crew.get_awareness_tip(context)

        return AwarenessResponse(message=message, context=context, message_type="awareness_tip")

    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_type": "InternalServerError",
                                                     "detail": f"Failed to generate awareness tip: {str(e)}"})


@router.get("/quiz/{topic}", response_model=QuizResponse, summary="Quick quiz question (GET)")
async def get_quiz_question_quick(topic: str):
    try:
        if not topic or topic.strip() == "":
            raise HTTPException(status_code=400,
                                detail={"error_type": "ValidationError", "detail": "Topic cannot be empty"})

        topic = topic.strip()
        crew = get_awareness_crew()
        quiz_json = crew.get_quiz_question(topic)

        quiz_data = json.loads(quiz_json)
        return QuizResponse(
            question=quiz_data.get("question", ""),
            options=quiz_data.get("options", {}),
            correct_answer=quiz_data.get("correct_answer", ""),
            explanation=quiz_data.get("explanation", ""),
            topic=topic
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_type": "InternalServerError",
                                                     "detail": f"Failed to generate quiz question: {str(e)}"})