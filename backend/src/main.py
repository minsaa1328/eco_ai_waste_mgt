import os
import sys
import litellm
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
#from .utils.auth import verify_clerk_token

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# --- Routers ---
from src.api import users_router
from src.api.orchestrator import router as orchestrator_router
from src.api.leaderboard_router import router as leaderboard_router
from src.api.rewards_router import router as rewards_router
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
        "http://localhost:3000",       # React
        "http://127.0.0.1:3000",
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
app.include_router(leaderboard_router)
app.include_router(rewards_router)

# --- Health & Root ---
@app.get("/")
def read_root():
    return {"message": "Eco AI Waste Manager API is running! Visit /docs for documentation."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "eco-ai-waste-manager"}

# Add to your main.py
@app.get("/debug/user/{clerk_id}")
async def debug_user(clerk_id: str):
    """Debug endpoint to check specific user structure"""
    from src.db import users_collection
    user = users_collection.find_one({"clerk_id": clerk_id})
    if user:
        user["_id"] = str(user["_id"])
        return {"user": user}
    else:
        return {"error": "User not found"}

# --- Debug endpoint to check rewards ---
@app.get("/debug/rewards")
async def debug_rewards():
    """Debug endpoint to check all rewards in database"""
    from src.db import rewards_collection
    rewards = list(rewards_collection.find())
    for reward in rewards:
        reward["_id"] = str(reward["_id"])
    return {"rewards": rewards}

# --- Run locally ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
