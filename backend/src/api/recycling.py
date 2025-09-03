import sys
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

# Add the correct path to Python path to resolve import issues
current_file = os.path.abspath(__file__)
backend_src_path = os.path.dirname(os.path.dirname(os.path.dirname(current_file)))
sys.path.insert(0, backend_src_path)

# Import after path setup with proper error handling
try:
    from src.models.request_models import GuideRequest
except ImportError as e:
    print(f"Could not import GuideRequest: {e}")


    # Fallback definition
    class GuideRequest(BaseModel):
        waste_category: str
        user_location: Optional[str] = None

try:
    from src.models.response_models import GuideResponse, ErrorResponse
except ImportError as e:
    print(f"Could not import response models: {e}")


    # Fallback definitions
    class GuideResponse(BaseModel):
        guide: str
        category: str


    class ErrorResponse(BaseModel):
        error_type: str
        detail: str

try:
    from src.crews.recycling_crew import RecyclingCrew

    print("Imported RecyclingCrew successfully")
except ImportError as e:
    print(f"Could not import RecyclingCrew: {e}")


    # Create a fallback crew based on the provided RecyclingCrew class
    class RecyclingCrew:
        def __init__(self):
            # Simplified version without crewai dependencies
            pass

        def get_guide(self, waste_category: str, user_location: Optional[str] = None):
            return f"""Recycling Guide for {waste_category.title()}:

1. Preparation: Rinse and clean items before recycling
2. Disposal: Place in appropriate recycling bin
3. Avoid: Contaminating with non-recyclable materials
4. Benefits: Reduces landfill waste and conserves resources
5. Location: {user_location or 'General guidelines apply'}

Remember to check local recycling regulations for specific requirements."""

# Create router for this specific module
router = APIRouter()

# Initialize crew with lazy loading to avoid import-time issues
_recycling_crew = None


def get_recycling_crew():
    """Lazy initialization of recycling crew"""
    global _recycling_crew
    if _recycling_crew is None:
        try:
            _recycling_crew = RecyclingCrew()
            print("Recycling crew initialized successfully!")
        except Exception as e:
            print(f"Crew initialization failed: {e}")

            # Fallback crew
            class FallbackCrew:
                def get_guide(self, waste_category: str, user_location: Optional[str] = None):
                    return f"Basic recycling instructions for {waste_category}: Reduce, reuse, recycle."

            _recycling_crew = FallbackCrew()
    return _recycling_crew


@router.post("",
             response_model=GuideResponse,
             responses={
                 400: {"model": ErrorResponse},
                 500: {"model": ErrorResponse}
             },
             summary="Get recycling guide",
             description="Returns detailed recycling instructions for a specific waste category")
async def get_recycling_guide(request: GuideRequest):
    """
    Get comprehensive recycling guidance for a specific waste material.

    - **waste_category**: The type of waste (e.g., "plastic", "glass", "cardboard")
    - **user_location**: Optional location for localized recycling guidelines

    Returns detailed recycling instructions and best practices.
    """
    try:
        if not request.waste_category or request.waste_category.strip() == "":
            raise HTTPException(
                status_code=400,
                detail={"error_type": "ValidationError", "detail": "Waste category cannot be empty"}
            )

        # Clean and format the waste category
        waste_category = request.waste_category.strip().lower()

        # Call the recycling crew directly (no orchestrator)
        recycling_crew = get_recycling_crew()
        guide_text = recycling_crew.get_guide(
            waste_category=waste_category,
            user_location=request.user_location
        )

        return GuideResponse(
            guide=guide_text,
            category=waste_category
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error_type": "InternalServerError", "detail": f"Failed to generate recycling guide: {str(e)}"}
        )


# GET endpoint for quick testing
@router.get("/{waste_category}",
            response_model=GuideResponse,
            summary="Quick recycling guide (GET)",
            description="Quick access to recycling guide using URL path parameter")
async def get_recycling_guide_quick(waste_category: str, location: str = None):
    """
    Quick access to recycling guide using URL parameters.

    - **waste_category**: The type of waste in the URL path
    - **location**: Optional query parameter for location-specific guidance
    """
    try:
        if not waste_category or waste_category.strip() == "":
            raise HTTPException(
                status_code=400,
                detail={"error_type": "ValidationError", "detail": "Waste category cannot be empty"}
            )

        waste_category = waste_category.strip().lower()

        # Call the recycling crew directly
        recycling_crew = get_recycling_crew()
        guide_text = recycling_crew.get_guide(
            waste_category=waste_category,
            user_location=location
        )

        return GuideResponse(
            guide=guide_text,
            category=waste_category
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error_type": "InternalServerError", "detail": f"Failed to generate recycling guide: {str(e)}"}
        )