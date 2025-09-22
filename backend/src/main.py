from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.recycling import router as recycling_router  # Direct import
from src.api.awareness import router as awareness_router
from src.api.classifier import router as classifier_router
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Eco AI Waste Manager API",
    description="API for AI-powered recycling guidance",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8501", "http://127.0.0.1:8501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(recycling_router, prefix="/api/recycling", tags=["Recycling"])
app.include_router(awareness_router, prefix="/api/awareness", tags=["Awareness"])
app.include_router(classifier_router, prefix="/api/classify", tags=["Classification"])

@app.get("/")
def read_root():
    return {"message": "Eco AI Waste Manager API is running! Visit /docs for documentation."}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "eco-ai-waste-manager"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
