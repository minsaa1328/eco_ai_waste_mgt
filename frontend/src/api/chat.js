/**
 * Chat Assistant API Client
 * Handles all chat-related API calls to the backend
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL + "/api/chat";

/**
 * Send a chat message to the assistant
 */
export async function sendChatMessage(token, message, recyclingGuide = null, wasteCategory = null) {
  try {
    const response = await axios.post(
      `${API_BASE}/chat`,
      {
        message,
        recycling_guide: recyclingGuide,
        waste_category: wasteCategory,
        include_history: true
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Chat message failed:", error);
    throw error;
  }
}

/**
 * Get chat history for the current user
 */
export async function getChatHistory(token, limit = 10) {
  try {
    const response = await axios.get(`${API_BASE}/chat/history`, {
      params: { limit },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("❌ Get chat history failed:", error);
    throw error;
  }
}

/**
 * Clear chat history for the current user
 */
export async function clearChatHistory(token) {
  try {
    const response = await axios.delete(`${API_BASE}/chat/history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("❌ Clear chat history failed:", error);
    throw error;
  }
}

/**
 * Get chat statistics
 */
export async function getChatStats(token) {
  try {
    const response = await axios.get(`${API_BASE}/chat/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("❌ Get chat stats failed:", error);
    throw error;
  }
}

