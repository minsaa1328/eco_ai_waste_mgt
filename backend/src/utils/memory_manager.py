"""
Memory Manager for Chat Assistant
Handles persistent conversation history and context management.
"""
import json
from datetime import datetime
from typing import Optional, List, Dict
from ..db import db

# Use MongoDB collection for chat history
chat_history_collection = db["chat_history"]


class MemoryManager:
    """
    Manages chat conversation memory and context for users.
    Stores conversations in MongoDB for persistence.
    """

    @staticmethod
    def save_context(user_id: str, user_message: str, assistant_response: str, recycling_guide: Optional[str] = None):
        """
        Save a chat interaction to the database.

        Args:
            user_id: Clerk user ID
            user_message: User's input message
            assistant_response: Chat assistant's response
            recycling_guide: Optional recycling guide context
        """
        try:
            interaction = {
                "user_id": user_id,
                "timestamp": datetime.utcnow(),
                "user_message": user_message,
                "assistant_response": assistant_response,
                "recycling_guide": recycling_guide
            }

            # Insert into chat history
            chat_history_collection.insert_one(interaction)

            # Also update user's chat history array (for quick access)
            from ..db import users_collection
            users_collection.update_one(
                {"clerk_id": user_id},
                {
                    "$push": {
                        "chat_history": {
                            "$each": [interaction],
                            "$slice": -50  # Keep only last 50 messages
                        }
                    }
                },
                upsert=True
            )

            print(f"✅ Saved chat context for user {user_id}")

        except Exception as e:
            print(f"⚠️ Failed to save chat context: {e}")

    @staticmethod
    def get_recent_context(user_id: str, limit: int = 10) -> List[Dict]:
        """
        Retrieve recent chat history for a user.

        Args:
            user_id: Clerk user ID
            limit: Number of recent messages to retrieve

        Returns:
            List of recent chat interactions
        """
        try:
            history = list(
                chat_history_collection.find(
                    {"user_id": user_id}
                )
                .sort("timestamp", -1)
                .limit(limit)
            )

            # Reverse to chronological order
            history.reverse()

            # Convert ObjectId to string for JSON serialization
            for item in history:
                item["_id"] = str(item["_id"])
                if "timestamp" in item:
                    item["timestamp"] = item["timestamp"].isoformat()

            return history

        except Exception as e:
            print(f"⚠️ Failed to retrieve chat context: {e}")
            return []

    @staticmethod
    def get_conversation_summary(user_id: str, limit: int = 5) -> str:
        """
        Get a formatted conversation summary for context injection.

        Args:
            user_id: Clerk user ID
            limit: Number of recent messages to include

        Returns:
            Formatted conversation history string
        """
        history = MemoryManager.get_recent_context(user_id, limit)

        if not history:
            return ""

        summary_parts = []
        for item in history:
            summary_parts.append(f"User: {item['user_message']}")
            summary_parts.append(f"Assistant: {item['assistant_response']}")

        return "\n".join(summary_parts)

    @staticmethod
    def get_latest_recycling_guide(user_id: str) -> Optional[str]:
        """
        Get the most recent recycling guide from chat history.

        Args:
            user_id: Clerk user ID

        Returns:
            Latest recycling guide or None
        """
        try:
            latest = chat_history_collection.find_one(
                {"user_id": user_id, "recycling_guide": {"$exists": True, "$ne": None}},
                sort=[("timestamp", -1)]
            )

            return latest.get("recycling_guide") if latest else None

        except Exception as e:
            print(f"⚠️ Failed to retrieve latest recycling guide: {e}")
            return None

    @staticmethod
    def clear_history(user_id: str):
        """
        Clear chat history for a user.

        Args:
            user_id: Clerk user ID
        """
        try:
            chat_history_collection.delete_many({"user_id": user_id})

            from ..db import users_collection
            users_collection.update_one(
                {"clerk_id": user_id},
                {"$set": {"chat_history": []}}
            )

            print(f"✅ Cleared chat history for user {user_id}")

        except Exception as e:
            print(f"⚠️ Failed to clear chat history: {e}")

    @staticmethod
    def get_chat_stats(user_id: str) -> Dict:
        """
        Get statistics about user's chat interactions.

        Args:
            user_id: Clerk user ID

        Returns:
            Dictionary with chat statistics
        """
        try:
            total_messages = chat_history_collection.count_documents({"user_id": user_id})

            return {
                "total_messages": total_messages,
                "has_history": total_messages > 0
            }

        except Exception as e:
            print(f"⚠️ Failed to get chat stats: {e}")
            return {"total_messages": 0, "has_history": False}

