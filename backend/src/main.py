import litellm
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from src.api.recycling import router as recycling_router
# from src.api.awareness import router as awareness_router
# from src.api.classifier import router as classifier_router
from src.api.orchestrator import router as orchestrator_router
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
openai_key = os.getenv('OPENAI_API_KEY')
if openai_key:
    litellm.openai_key = openai_key
    os.environ['OPENAI_API_KEY'] = openai_key
    print("✅ OpenAI API key configured for LiteLLM")
else:
    print("❌ OPENAI_API_KEY not found in environment variables")


app = FastAPI(
    title="Eco AI Waste Manager API",
    description="API for AI-powered recycling guidance",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173","http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# app.include_router(recycling_router, prefix="/api/recycling", tags=["Recycling"])
# app.include_router(awareness_router, prefix="/api/awareness", tags=["Awareness"])
# app.include_router(classifier_router, prefix="/api/classify", tags=["Classification"])
app.include_router(orchestrator_router, prefix="/api/orchestrator", tags=["Orchestrator"])

@app.get("/")
def read_root():
    return {"message": "Eco AI Waste Manager API is running! Visit /docs for documentation."}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "eco-ai-waste-manager"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
