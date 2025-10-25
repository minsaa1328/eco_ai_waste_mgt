"""
Chat Assistant API Router
Handles chat interactions with recycling guide context and memory.
"""
import traceback
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict

# ✅ Clerk + MongoDB integration
from ..utils.auth import verify_clerk_token
from ..utils.memory_manager import MemoryManager
from ..db import users_collection

# ✅ Chat Assistant Crew
from ..crews.chat_assistant_crew import ChatAssistantCrew

# Initialize router and chat assistant
router = APIRouter()
chat_assistant = ChatAssistantCrew()


# -------------------- MODELS --------------------
class ChatRequest(BaseModel):
    """Chat message request with optional context"""
    message: str
    recycling_guide: Optional[str] = None
    waste_category: Optional[str] = None
    include_history: bool = True


class ChatHistoryRequest(BaseModel):
    """Request to retrieve chat history"""
    limit: int = 10


# -------------------- CHAT ENDPOINT --------------------
@router.post("/chat")
async def handle_chat(request: ChatRequest, user=Depends(verify_clerk_token)):
    """
    Handle chat interaction with the recycling guide assistant.
    Maintains conversation history and context awareness.

    Args:
        request: Chat request containing user message and optional context
        user: Authenticated user from Clerk

    Returns:
        Assistant's response with conversation metadata
    """
    # Validate user
    if not isinstance(user, dict) or not user.get("id"):
        raise HTTPException(status_code=401, detail="Invalid or missing user authentication")

    try:
        user_id = user["id"]

        # Get conversation history if requested
        conversation_history = None
        if request.include_history:
            history_summary = MemoryManager.get_conversation_summary(user_id, limit=5)
            conversation_history = history_summary if history_summary else None

        # If no recycling guide provided, try to get the latest one
        recycling_guide = request.recycling_guide
        if not recycling_guide:
            recycling_guide = MemoryManager.get_latest_recycling_guide(user_id)

        # Generate response from chat assistant
        response = chat_assistant.chat(
            user_message=request.message,
            recycling_guide=recycling_guide,
            conversation_history=conversation_history,
            waste_category=request.waste_category
        )

        # Save interaction to memory
        MemoryManager.save_context(
            user_id=user_id,
            user_message=request.message,
            assistant_response=response,
            recycling_guide=recycling_guide
        )

        # Award points for engagement
        try:
            users_collection.update_one(
                {"clerk_id": user_id},
                {"$inc": {"points": 1}},  # +1 point per chat message
                upsert=True
            )
        except Exception as db_err:
            print(f"⚠️ MongoDB points update failed: {db_err}")

        return {
            "response": response,
            "metadata": {
                "has_guide_context": bool(recycling_guide),
                "waste_category": request.waste_category,
                "used_history": bool(conversation_history)
            }
        }

    except Exception as e:
        tb = traceback.format_exc()
        print(f"❌ Exception in /chat: {e}\n{tb}")
        raise HTTPException(status_code=500, detail={"error": str(e), "trace": tb[:2000]})


# -------------------- CHAT HISTORY ENDPOINTS --------------------
@router.get("/chat/history")
async def get_chat_history(limit: int = 10, user=Depends(verify_clerk_token)):
    """
    Retrieve user's chat history.

    Args:
        limit: Number of recent messages to retrieve
        user: Authenticated user from Clerk

    Returns:
        List of recent chat interactions
    """
    if not isinstance(user, dict) or not user.get("id"):
        raise HTTPException(status_code=401, detail="Invalid or missing user authentication")

    try:
        user_id = user["id"]
        history = MemoryManager.get_recent_context(user_id, limit=limit)
        stats = MemoryManager.get_chat_stats(user_id)

        return {
            "history": history,
            "stats": stats
        }

    except Exception as e:
        tb = traceback.format_exc()
        print(f"❌ Exception in /chat/history: {e}\n{tb}")
        raise HTTPException(status_code=500, detail={"error": str(e), "trace": tb[:2000]})


@router.delete("/chat/history")
async def clear_chat_history(user=Depends(verify_clerk_token)):
    """
    Clear user's chat history.

    Args:
        user: Authenticated user from Clerk

    Returns:
        Success confirmation
    """
    if not isinstance(user, dict) or not user.get("id"):
        raise HTTPException(status_code=401, detail="Invalid or missing user authentication")

    try:
        user_id = user["id"]
        MemoryManager.clear_history(user_id)

        return {
            "message": "Chat history cleared successfully",
            "user_id": user_id
        }

    except Exception as e:
        tb = traceback.format_exc()
        print(f"❌ Exception in /chat/history DELETE: {e}\n{tb}")
        raise HTTPException(status_code=500, detail={"error": str(e), "trace": tb[:2000]})


# -------------------- CHAT STATS ENDPOINT --------------------
@router.get("/chat/stats")
async def get_chat_stats(user=Depends(verify_clerk_token)):
    """
    Get user's chat interaction statistics.

    Args:
        user: Authenticated user from Clerk

    Returns:
        Chat usage statistics
    """
    if not isinstance(user, dict) or not user.get("id"):
        raise HTTPException(status_code=401, detail="Invalid or missing user authentication")

    try:
        user_id = user["id"]
        stats = MemoryManager.get_chat_stats(user_id)

        return stats

    except Exception as e:
        tb = traceback.format_exc()
        print(f"❌ Exception in /chat/stats: {e}\n{tb}")
        raise HTTPException(status_code=500, detail={"error": str(e), "trace": tb[:2000]})

