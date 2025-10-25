import os
import litellm
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .utils.auth import verify_clerk_token

# --- Routers ---
from src.api import users_router
from src.api.orchestrator import router as orchestrator_router
from src.api.chat_assistant import router as chat_assistant_router

# Load environment variables
load_dotenv()

# ✅ Configure OpenAI / LiteLLM key
openai_key = os.getenv("OPENAI_API_KEY")
if openai_key:
    litellm.openai_key = openai_key
    os.environ["OPENAI_API_KEY"] = openai_key
    print("✅ OpenAI API key configured for LiteLLM")
else:
    print("❌ OPENAI_API_KEY not found in environment variables")

# ✅ Temporary compatibility patch for Python 3.13
import collections
import collections.abc
for name in ["Mapping", "MutableMapping", "Sequence"]:
    if not hasattr(collections, name):
        setattr(collections, name, getattr(collections.abc, name))

# --- FastAPI App ---
app = FastAPI(
    title="Eco AI Waste Manager API",
    description="API for AI-powered waste classification, recycling, and awareness.",
    version="1.0.0",
)

# --- CORS Middleware (React + Clerk) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",       # Vite dev
        "http://127.0.0.1:5173",
        "http://localhost:5176",       # Alternative Vite port
        "http://127.0.0.1:5176",
        "http://localhost:8501",       # Streamlit or testing
        "http://127.0.0.1:8501",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(users_router.router, prefix="/api/users", tags=["Users"])
app.include_router(orchestrator_router, prefix="/api/orchestrator", tags=["Orchestrator"])
app.include_router(chat_assistant_router, prefix="/api/chat", tags=["Chat Assistant"])

# --- Health & Root ---
@app.get("/")
def read_root():
    return {"message": "Eco AI Waste Manager API is running! Visit /docs for documentation."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "eco-ai-waste-manager"}

# --- Run locally ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
