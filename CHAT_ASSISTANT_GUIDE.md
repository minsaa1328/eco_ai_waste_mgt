# 🤖 Chat Assistant Feature - Implementation Guide

## Overview

The **Chat Assistant** is an AI-powered conversational agent that helps users understand recycling guides and ask follow-up questions about waste disposal. It integrates seamlessly with the classification and recycling workflows.

---

## 🏗️ Architecture

### Backend Components

#### 1. **Memory Manager** (`src/utils/memory_manager.py`)
- **Purpose:** Manages persistent conversation history in MongoDB
- **Key Features:**
  - Stores chat messages with timestamps
  - Retrieves recent conversation context (default: 10 messages)
  - Automatically saves recycling guide context
  - Provides conversation summaries for context injection
  - User-specific chat history management

**Key Methods:**
```python
MemoryManager.save_context(user_id, user_message, assistant_response, recycling_guide)
MemoryManager.get_recent_context(user_id, limit=10)
MemoryManager.get_conversation_summary(user_id, limit=5)
MemoryManager.get_latest_recycling_guide(user_id)
MemoryManager.clear_history(user_id)
```

#### 2. **Chat Assistant Crew** (`src/crews/chat_assistant_crew.py`)
- **Purpose:** CrewAI agent specialized in recycling guide explanations
- **Agent Role:** "Recycling Guide Chat Assistant"
- **Capabilities:**
  - Context-aware responses using recycling guides
  - Multi-turn conversation support
  - Maintains conversation history awareness
  - Provides fallback responses when AI service fails

**Agent Behavior:**
```python
chat_assistant.chat(
    user_message="How do I recycle this safely?",
    recycling_guide="[Full recycling guide text]",
    conversation_history="[Previous conversation]",
    waste_category="plastic bottle"
)
```

#### 3. **Chat API Router** (`src/api/chat_assistant.py`)
- **Endpoints:**
  - `POST /api/chat/chat` - Send chat message
  - `GET /api/chat/chat/history` - Get conversation history
  - `DELETE /api/chat/chat/history` - Clear chat history
  - `GET /api/chat/chat/stats` - Get chat statistics

**Points System:**
- +1 point per chat message (encourages engagement)

---

## 🔄 Integration Workflow

### Automatic Context Flow

1. **User classifies waste** (text or image)
   ↓
2. **OrchestratorCrew runs:**
   - ClassifierCrew → identifies category
   - RecyclingCrew → generates guide
   - AwarenessCrew → provides tips
   ↓
3. **Orchestrator automatically saves recycling guide to MemoryManager**
   - Stored with user_id
   - Tagged with waste category
   ↓
4. **User clicks "Ask Questions About Recycling"**
   ↓
5. **Chat Assistant opens with:**
   - Pre-loaded recycling guide context
   - Previous conversation history
   - Waste category awareness
   ↓
6. **User asks questions** → Assistant provides context-aware answers
   ↓
7. **Each interaction saved to MongoDB** for continuity

---

## 💾 Database Schema

### MongoDB Collections

#### `chat_history` Collection
```json
{
  "_id": "ObjectId",
  "user_id": "clerk_user_abc123",
  "timestamp": "2025-10-25T10:30:00Z",
  "user_message": "How do I recycle this safely?",
  "assistant_response": "To recycle this plastic bottle safely...",
  "recycling_guide": "[Full recycling guide text]"
}
```

#### `users` Collection (Updated)
```json
{
  "clerk_id": "user_abc123",
  "points": 58,
  "history": [...],
  "chat_history": [
    {
      "user_message": "...",
      "assistant_response": "...",
      "timestamp": "..."
    }
  ]
}
```

---

## 🎨 Frontend Components

### 1. **ChatAssistant Component** (`components/pages/ChatAssistant.jsx`)

**Features:**
- Modal-based chat interface
- Auto-loads conversation history
- Displays recycling guide context indicator
- Real-time message streaming
- Auto-scroll to latest message
- Clear history functionality

**Props:**
```javascript
<ChatAssistant
  isOpen={true}
  onClose={() => setChatOpen(false)}
  recyclingGuide="[Guide text from classification]"
  wasteCategory="plastic bottle"
/>
```

### 2. **Chat API Client** (`api/chat.js`)

**Functions:**
```javascript
sendChatMessage(token, message, recyclingGuide, wasteCategory)
getChatHistory(token, limit=10)
clearChatHistory(token)
getChatStats(token)
```

### 3. **Classifier Integration**

**Updated Flow:**
1. User uploads image or enters text
2. Backend classifies and generates guide
3. Result displayed with new **"Ask Questions About Recycling"** button
4. Button opens Chat Assistant with pre-loaded context
5. User can ask unlimited questions about their specific item

---

## 🚀 Usage Examples

### Backend API Examples

#### Send Chat Message
```bash
POST /api/chat/chat
Authorization: Bearer <clerk_token>

{
  "message": "Can I recycle this with food residue?",
  "recycling_guide": "[Guide from classification]",
  "waste_category": "plastic container",
  "include_history": true
}

Response:
{
  "response": "No, you should rinse the container first...",
  "metadata": {
    "has_guide_context": true,
    "waste_category": "plastic container",
    "used_history": true
  }
}
```

#### Get Chat History
```bash
GET /api/chat/chat/history?limit=5
Authorization: Bearer <clerk_token>

Response:
{
  "history": [
    {
      "user_message": "How do I recycle this?",
      "assistant_response": "First, rinse the container...",
      "timestamp": "2025-10-25T10:30:00Z"
    }
  ],
  "stats": {
    "total_messages": 12,
    "has_history": true
  }
}
```

---

## 🎯 Key Features Implemented

### ✅ Context Awareness
- **Recycling Guide Integration:** Guide automatically passed to chat
- **Waste Category Tracking:** Assistant knows what item is being discussed
- **Conversation History:** Maintains context across multiple questions

### ✅ Memory Management
- **MongoDB Persistence:** All conversations saved to database
- **History Retrieval:** Last 10 messages loaded on chat open
- **Context Summaries:** Recent conversation injected into AI prompts
- **Automatic Guide Storage:** Classification → Guide → Memory (automatic)

### ✅ User Experience
- **Pre-loaded Context:** Chat opens with recycling guide already loaded
- **No Re-classification:** User asks questions without re-uploading images
- **Persistent Conversations:** Return to chat later with history intact
- **Clear History Option:** Users can reset conversation

### ✅ Fallback Handling
- **AI Service Failures:** Intelligent fallback responses
- **Keyword Matching:** Basic responses when CrewAI unavailable
- **Error Messages:** User-friendly error handling

---

## 📊 Points & Gamification

| Action | Points Awarded |
|--------|---------------|
| Text Classification | +3 points |
| Image Classification | +5 points |
| Correct Quiz Answer | +10 points |
| **Chat Message** | **+1 point** |

**Encourages:** User engagement through learning and asking questions

---

## 🔧 Configuration

### Environment Variables (Already Set)
```env
# Backend (.env)
OPENAI_API_KEY=sk-...
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER_URL=https://...clerk.accounts.dev
MONGODB_URI=mongodb://localhost:27017/eco_ai

# Frontend (.env.local)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8000
```

---

## 🧪 Testing the Chat Assistant

### Test Flow

1. **Start Backend:**
   ```bash
   cd backend
   uvicorn src.main:app --reload --port 8000
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Classification → Chat:**
   - Navigate to `/classifier`
   - Upload image of plastic bottle
   - Wait for classification + recycling guide
   - Click **"Ask Questions About Recycling"**
   - Chat opens with guide context pre-loaded
   - Ask: "Can I recycle this with the cap on?"
   - Receive context-aware answer

4. **Test Persistence:**
   - Close chat modal
   - Re-open chat
   - Verify previous messages are loaded
   - Continue conversation

5. **Test History Clear:**
   - Click trash icon in chat header
   - Confirm deletion
   - Verify messages cleared

---

## 🐛 Troubleshooting

### Common Issues

**1. Chat History Not Loading**
- Check MongoDB connection
- Verify `chat_history` collection exists
- Check browser console for auth errors

**2. Recycling Guide Not Auto-Loading**
- Ensure classification completed successfully
- Check backend logs for memory save confirmation
- Verify `needs` parameter includes "guide" or "recycle"

**3. Chat Assistant Not Responding**
- Check OpenAI API key validity
- Verify CrewAI agent initialization
- Check backend logs for agent errors
- Fallback responses should still work

**4. Points Not Awarded**
- Check MongoDB connection
- Verify user authentication (Clerk token)
- Check backend logs for update errors

---

## 📝 Code Quality Notes

**Warnings (Non-Critical):**
- Unused imports in some files (safe to ignore)
- Timezone warnings in datetime (MongoDB handles UTC)

**All critical functionality working:**
- ✅ Chat message handling
- ✅ Memory persistence
- ✅ Context injection
- ✅ Frontend-backend integration
- ✅ Authentication
- ✅ Error handling

---

## 🚀 Future Enhancements

- [ ] Voice input for chat messages
- [ ] Image upload in chat for clarification
- [ ] Chat export/download functionality
- [ ] Suggested questions based on waste type
- [ ] Multi-language chat support
- [ ] Chat analytics dashboard
- [ ] Share chat conversations

---

## 📚 API Documentation

Full API documentation available at: `http://localhost:8000/docs`

**Chat Assistant Endpoints:**
- `/api/chat/chat` - Main chat endpoint
- `/api/chat/chat/history` - History management
- `/api/chat/chat/stats` - Usage statistics

---

## ✨ Summary

The Chat Assistant feature is **fully implemented** and ready for use! It provides:

1. **Seamless Integration** with existing classification workflow
2. **Persistent Memory** via MongoDB
3. **Context-Aware Conversations** using recycling guides
4. **Multi-Turn Support** with conversation history
5. **Fallback Handling** for reliability
6. **Points Rewards** for engagement

**Test it now by running both servers and classifying a waste item!** 🎉

