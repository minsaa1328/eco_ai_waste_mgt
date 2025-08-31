from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.recycling import router as recycling_router  # Direct import
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

# Include only the recycling router for now
app.include_router(recycling_router, prefix="/api/v1/recycling", tags=["Recycling"])

@app.get("/")
def read_root():
    return {"message": "Eco AI Waste Manager API is running! Visit /docs for documentation."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "recycling-guide"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)