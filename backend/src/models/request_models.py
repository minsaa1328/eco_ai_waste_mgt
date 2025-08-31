from pydantic import BaseModel, Field
from typing import Optional

class ClassificationRequest(BaseModel):
    image_data: str = Field(..., description="Base64 encoded image string")

class GuideRequest(BaseModel):
    waste_category: str = Field(..., description="Category of waste to get guidance for")
    user_location: Optional[str] = Field(None, description="User's location for localized guidance")

class AwarenessRequest(BaseModel):
    topic: str = Field(..., description="Topic for eco-awareness information")