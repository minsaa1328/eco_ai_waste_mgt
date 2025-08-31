from fastapi import APIRouter, HTTPException
from models.request_models import GuideRequest
from models.response_models import GuideResponse, ErrorResponse
from crews.recycling_crew import RecyclingCrew  # Direct import, no orchestrator

# Create router for this specific module
router = APIRouter()
recycling_crew = RecyclingCrew()  # Instantiate the crew directly


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