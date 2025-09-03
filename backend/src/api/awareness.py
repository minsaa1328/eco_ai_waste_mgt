import sys
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Add the correct path to Python path
current_file = os.path.abspath(__file__)
backend_src_path = os.path.dirname(os.path.dirname(os.path.dirname(current_file)))
sys.path.insert(0, backend_src_path)  # Add to beginning of path

print(f"🔧 Added to Python path: {backend_src_path}")

# Import after path setup with proper error handling
try:
    from src.models.response_models import ErrorResponse
    print("Imported ErrorResponse successfully")
except ImportError as e:
    print(f"Could not import ErrorResponse: {e}")

    # Fallback definition
    class ErrorResponse(BaseModel):
        error_type: str
        detail: str

try:
    from src.crews.awareness_crew import AwarenessCrew
    print("Imported AwarenessCrew successfully")
except ImportError as e:
    print(f"Could not import AwarenessCrew: {e}")

    # Create a simple fallback crew
    class AwarenessCrew:
        def get_awareness_message(self):
            return """Fact: Recycling one glass bottle saves enough energy to power a lightbulb for 4 hours.
Tip: Carry a reusable bag instead of single-use plastic bags.
Quiz Question: How long does it take for plastic to decompose?
Quiz Options: A) 50 years | B) 100 years | C) 450 years
Quiz Answer: C) 450 years
"""


# Awareness Response model
class AwarenessResponse(BaseModel):
    fact: str
    tip: str
    quiz_question: str
    quiz_options: str
    quiz_answer: str


# Create router for Awareness Agent
router = APIRouter()

# Initialize crew lazily
_awareness_crew = None


def get_awareness_crew():
    """Lazy initialization of awareness crew"""
    global _awareness_crew
    if _awareness_crew is None:
        try:
            _awareness_crew = AwarenessCrew()
            print("Awareness crew initialized successfully!")
        except Exception as e:
            print(f"Crew initialization failed: {e}")

            # Fallback crew
            class FallbackCrew:
                def get_awareness_message(self):
                    return """Fact: Recycling one glass bottle saves enough energy to power a lightbulb for 4 hours.
Tip: Compost your food waste to reduce landfill usage.
Quiz Question: What percentage of plastic is actually recycled?
Quiz Options: A) 20% | B) 30% | C) 9%
Quiz Answer: C) 9%
"""

            _awareness_crew = FallbackCrew()
    return _awareness_crew


def parse_awareness_message(raw_message: str) -> AwarenessResponse:
    """Convert the plain text message into structured response"""
    try:
        lines = raw_message.splitlines()
        fact = next((l.replace("Fact:", "").strip() for l in lines if l.startswith("Fact:")), "")
        tip = next((l.replace("Tip:", "").strip() for l in lines if l.startswith("Tip:")), "")
        quiz_question = next((l.replace("Quiz Question:", "").strip() for l in lines if l.startswith("Quiz Question:")), "")
        quiz_options = next((l.replace("Quiz Options:", "").strip() for l in lines if l.startswith("Quiz Options:")), "")
        quiz_answer = next((l.replace("Quiz Answer:", "").strip() for l in lines if l.startswith("Quiz Answer:")), "")

        return AwarenessResponse(
            fact=fact,
            tip=tip,
            quiz_question=quiz_question,
            quiz_options=quiz_options,
            quiz_answer=quiz_answer
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error_type": "ParseError", "detail": f"Failed to parse message: {str(e)}"}
        )


@router.post("/",
             response_model=AwarenessResponse,
             responses={
                 400: {"model": ErrorResponse},
                 500: {"model": ErrorResponse}
             },
             summary="Get awareness message",
             description="Returns an educational waste management awareness message (fact, tip, quiz).")
async def get_awareness_message():
    try:
        crew = get_awareness_crew()
        raw_message = crew.get_awareness_message()
        return parse_awareness_message(raw_message)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error_type": "InternalServerError", "detail": f"Failed to generate awareness message: {str(e)}"}
        )


@router.get("/quick",
            response_model=AwarenessResponse,
            summary="Quick awareness message (GET)",
            description="Quick access to awareness messages for waste management.")
async def get_awareness_message_quick():
    try:
        crew = get_awareness_crew()

        raw_message = crew.get_awareness_message()
        return parse_awareness_message(raw_message)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error_type": "InternalServerError", "detail": f"Failed to generate awareness message: {str(e)}"}
        )
