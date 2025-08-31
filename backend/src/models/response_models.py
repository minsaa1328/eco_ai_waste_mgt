from pydantic import BaseModel

class ClassificationResponse(BaseModel):
    category: str
    confidence: str
    full_analysis: str

class GuideResponse(BaseModel):
    guide: str
    category: str

class AwarenessResponse(BaseModel):
    fact: str
    topic: str

class ErrorResponse(BaseModel):
    detail: str
    error_type: str