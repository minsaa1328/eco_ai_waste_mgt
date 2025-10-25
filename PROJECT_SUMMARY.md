# 🌍 EcoSmart AI Waste Management System

## 📋 Project Overview

**EcoSmart AI** is an intelligent waste management platform that leverages AI agents to help users classify waste, get recycling guidance, learn about environmental awareness, and earn rewards through gamification.

---

## 🛠️ Technologies Stack

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **AI Orchestration:** CrewAI (multi-agent system)
- **AI Models:** OpenAI GPT (via LiteLLM), Google Gemini
- **Authentication:** Clerk (JWT-based)
- **Database:** MongoDB
- **Key Libraries:** 
  - `crewai[tools]` - AI agent orchestration
  - `fastapi` - REST API framework
  - `uvicorn` - ASGI server
  - `python-dotenv` - Environment management
  - `Pillow` - Image processing
  - `pymongo` - MongoDB driver

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Authentication:** Clerk React SDK
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **UI Components:** Custom components with Lucide icons
- **Styling:** Tailwind CSS (likely)

---

## 🤖 AI Agent System (CrewAI Architecture)

The system uses **multiple specialized AI agents** orchestrated by the `OrchestratorCrew`:

### 1. **Classifier Agent** (`ClassifierCrew`)
- **Purpose:** Identifies waste categories from text or images
- **Input:** Text description or image file
- **Output:** Waste category (e.g., "plastic", "organic", "electronic")

### 2. **Recycling Agent** (`RecyclingCrew`)
- **Purpose:** Provides location-specific recycling guidelines
- **Input:** Waste category + user location
- **Output:** Step-by-step recycling instructions

### 3. **Awareness Agent** (`AwarenessCrew`)
- **Purpose:** Educates users with environmental facts and tips
- **Input:** Context (e.g., waste type, action)
- **Output:** Motivational messages, educational content

### 4. **Quiz Agent** (Part of `AwarenessCrew`)
- **Purpose:** Generates educational quizzes for gamification
- **Input:** Topic (e.g., "plastic recycling")
- **Output:** Multiple-choice questions with explanations

### 5. **Responsible AI Agent** (`ResponsibleAICrew`)
- **Purpose:** Ensures ethical AI usage and content moderation
- **Input:** User requests and agent outputs
- **Output:** Safety checks and compliance validation

---

## 🔄 Key Features

### ✅ Waste Classification
- **Text-based:** Users describe waste items
- **Image-based:** Users upload photos for visual classification
- **Multi-agent workflow:** Classification → Recycling Guide → Awareness Tip → Quiz

### ♻️ Recycling Guidance
- Location-aware recycling instructions
- Step-by-step disposal guidelines
- Facility finder (via Serper API)

### 🎓 Environmental Awareness
- Real-time educational tips
- Fact-based motivation
- Context-aware messaging

### 🎮 Gamification & Rewards
- Quiz system with multiple-choice questions
- Points system:
  - +3 points for text classification
  - +5 points for image classification
  - +10 points for correct quiz answers
- User history tracking in MongoDB

### 🔐 Authentication
- Clerk-based JWT authentication
- User profiles with points and history
- Protected routes and endpoints

---

## 📁 Project Structure

```
eco_ai_waste_mgt/
├── backend/
│   ├── src/
│   │   ├── api/               # API endpoints
│   │   │   ├── orchestrator.py    # Main orchestration endpoint
│   │   │   ├── users_router.py    # User management
│   │   │   └── ...
│   │   ├── crews/             # AI agent definitions
│   │   │   ├── orchestrator_crew.py
│   │   │   ├── classifier_crew.py
│   │   │   ├── recycling_crew.py
│   │   │   ├── awareness_crew.py
│   │   │   └── responsibleAICrew.py
│   │   ├── models/            # Pydantic models
│   │   ├── utils/             # Auth, API helpers
│   │   │   ├── auth.py        # Clerk JWT verification
│   │   │   └── serper_api.py  # Search API integration
│   │   ├── db.py              # MongoDB connection
│   │   └── main.py            # FastAPI app entry
│   ├── .env                   # Environment variables
│   └── pyproject.toml         # Dependencies
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/        # Header, Sidebar, TopNav
    │   │   ├── pages/         # Dashboard, Classifier, etc.
    │   │   └── ui/            # Reusable UI components
    │   ├── api/               # API client functions
    │   ├── App.jsx            # Main app component
    │   ├── AppRouter.jsx      # Route definitions
    │   └── main.jsx           # Entry point
    ├── .env.local             # Frontend env vars
    └── package.json           # Dependencies
```

---

## 🚀 How to Run

### Backend Setup
```bash
cd backend

# Install dependencies (using uv or pip)
pip install -e .

# Set environment variables in .env:
# - OPENAI_API_KEY
# - CLERK_SECRET_KEY
# - CLERK_ISSUER_URL
# - MONGODB_URI (if using MongoDB)
# - SERPER_API_KEY (for search)

# Run server
uvicorn src.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables in .env.local:
# - VITE_CLERK_PUBLISHABLE_KEY
# - VITE_API_URL=http://localhost:8000

# Run dev server
npm run dev
```

---

## 🔧 Recent Fixes Applied

### ✅ Fixed Issues:

1. **CORS Error (Port 5176)**
   - Added `http://localhost:5176` to allowed origins
   - Frontend can now communicate with backend

2. **KeyError: 'steps' in Quiz Generation**
   - Added safe access to `quiz["steps"]` with fallback
   - Prevents 500 errors when quiz structure is unexpected

3. **Missing Quiz Task Handler**
   - Added `quiz` task handler in `OrchestratorCrew`
   - Routes quiz requests to `AwarenessCrew.get_quiz_question()`

4. **Clerk Authentication (401 Errors)**
   - Fixed environment variable name: `CLERK_ISSUER_URL` → `CLERK_ISSUER`
   - Auth now properly loads issuer from `.env`

---

## 🌐 API Endpoints

### Orchestrator Routes (`/api/orchestrator`)
- **POST `/handle`** - Text-based multi-agent tasks
- **POST `/handle/image`** - Image classification with optional agents
- **POST `/quiz/answer`** - Validate quiz answers and award points

### User Routes (`/api/users`)
- User profile management
- Points and history tracking

### Health Check
- **GET `/health`** - Service status

---

## 🎯 User Flow Example

1. **User uploads waste image** → Frontend sends to `/api/orchestrator/handle/image`
2. **Classifier Agent** identifies it as "plastic bottle"
3. **Recycling Agent** provides disposal instructions
4. **Awareness Agent** shares environmental tip
5. **Quiz Agent** generates question about plastic recycling
6. **User answers quiz** → Earns +10 points if correct
7. **Points saved to MongoDB** with history

---

## 🔑 Environment Variables

### Backend (`.env`)
```env
OPENAI_API_KEY=sk-...
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER_URL=https://your-instance.clerk.accounts.dev
MONGODB_URI=mongodb://localhost:27017/eco_ai
SERPER_API_KEY=...
GEMINI_API_KEY=...
```

### Frontend (`.env.local`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8000
```

---

## 📊 Database Schema (MongoDB)

### Users Collection
```json
{
  "clerk_id": "user_abc123",
  "points": 45,
  "history": [
    {
      "type": "image_classification",
      "classification": "plastic",
      "timestamp": "2025-10-25T..."
    },
    {
      "type": "quiz_attempt",
      "is_correct": true,
      "question": "...",
      "timestamp": "2025-10-25T..."
    }
  ]
}
```

---

## 🎨 Frontend Routes

- `/` - Home page (landing)
- `/dashboard` - User dashboard (protected)
- `/classifier` - Waste classification (protected)
- `/recycling-guide` - Recycling information
- `/awareness` - Environmental education
- `/rewards` - Rewards and commercial features
- `/reports` - Analytics
- `/settings` - User settings

---

## 🐛 Debugging Tips

### Backend Logs
- Check terminal for agent execution logs
- MongoDB connection status
- Clerk verification steps

### Frontend Logs
- Browser console for API errors
- Network tab for CORS issues
- Check Clerk authentication status

### Common Issues
- **401 Unauthorized:** Check Clerk keys and issuer URL
- **500 Internal Server Error:** Check backend logs for agent errors
- **CORS blocked:** Verify frontend port in backend CORS settings

---

## 🚧 Future Enhancements

- [ ] Add user profile page with statistics
- [ ] Implement leaderboard system
- [ ] Add social sharing features
- [ ] Expand quiz question database
- [ ] Add multilingual support
- [ ] Integrate real-time notifications
- [ ] Add waste tracking analytics

---

## 📝 License & Credits

This is an educational/demonstration project showcasing AI-powered environmental solutions.

**Key Technologies:**
- CrewAI for multi-agent orchestration
- Clerk for authentication
- OpenAI GPT for natural language processing
- MongoDB for data persistence

