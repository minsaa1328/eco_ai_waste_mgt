import streamlit as st
import requests
import json

st.set_page_config(
    page_title="♻️ Eco AI Waste Manager",
    page_icon="♻️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        color: #2E8B57;
        text-align: center;
        margin-bottom: 2rem;
    }
    .success-box {
        background-color: #DFF2DF;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #4CAF50;
    }
    .info-box {
        background-color: #E3F2FD;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #2196F3;
    }
    .guide-box {
        background-color: #FFF3E0;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 4px solid #FF9800;
        margin-top: 1rem;
    }
    .quiz-box {
        background-color: #604B63;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 4px solid #9C27B0;
        margin-top: 1rem;
    }
    .tip-box {
        background-color: #147514;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 4px solid #4CAF50;
        margin-top: 1rem;
    }
    .stButton>button {
        width: 100%;
        background-color: #4CAF50;
        color: white;
        font-weight: bold;
    }
    .stButton>button:hover {
        background-color: #45a049;
    }
    .quiz-option {
        background-color: #720808;
        padding: 0.5rem;
        margin: 0.25rem 0;
        border-radius: 0.25rem;
        cursor: pointer;
    }
    .quiz-option:hover {
        background-color: #990404;
    }
    .correct-answer {
        background-color: #09A40E;
        border-left: 4px solid #4CAF50;
    }
    .wrong-answer {
        background-color: #BA0718;
        border-left: 4px solid #F44336;
    }
</style>
""", unsafe_allow_html=True)


def main():
    # Header
    st.markdown('<h1 class="main-header">♻️ Eco AI Waste Manager</h1>', unsafe_allow_html=True)
    st.markdown("### Get instant recycling guidance, waste classification, and educational content")

    # Tabs - ADDED AWARENESS TAB
    tab1, tab2, tab3, tab4 = st.tabs([
        "🧴 Get Recycling Guide",
        "📋 Quick Guide (Text)",
        "🧪 Waste Classification",
        "🌟 Awareness & Education"  # NEW TAB
    ])

    # --- Recycling Guide (existing) ---
    with tab1:
        st.markdown("### 🧴 Get Detailed Recycling Instructions")
        col1, col2 = st.columns([1, 1])
        with col1:
            waste_category = st.selectbox(
                "Select Waste Type",
                ["plastic", "paper", "glass", "metal", "cardboard", "electronics", "organic"],
                help="Choose the type of waste material",
                key="tab1_waste"
            )
            location = st.text_input("📍 Your Location (Optional)", placeholder="e.g., New York, USA", key="tab1_loc")
            if st.button("♻️ Get Recycling Guide", type="primary", key="tab1_btn"):
                get_recycling_guide(waste_category, location)
        with col2:
            st.info("""
            **💡 Tips:**
            - Select the waste material type
            - Add your location for region-specific guidance
            - Get detailed recycling instructions instantly
            """)

    # --- Quick Guide (existing) ---
    with tab2:
        st.markdown("### 📋 Quick Recycling Lookup")
        quick_waste = st.text_input("Enter waste material", placeholder="e.g., plastic bottles, aluminum cans",
                                    key="tab2_input")
        if st.button("🔍 Quick Search", key="tab2_btn"):
            if quick_waste:
                get_recycling_guide(quick_waste, None)
            else:
                st.warning("Please enter a waste material type")

    # --- Classification Tab (existing) ---
    with tab3:
        st.markdown("### 🧪 AI-Powered Waste Classification")
        st.write("Classify waste into **recyclable, organic, hazardous, or general**")

        col1, col2 = st.columns(2)

        # Text classification
        with col1:
            st.subheader("🔤 Classify by Text")
            text_input = st.text_input("Enter waste description", placeholder="e.g., banana peel, plastic bottle",
                                       key="tab3_text")
            if st.button("Classify Text", key="tab3_text_btn"):
                if text_input.strip():
                    classify_text(text_input)
                else:
                    st.warning("Please enter a description.")

        # Image classification
        with col2:
            st.subheader("🖼️ Classify by Image")
            uploaded_file = st.file_uploader("Upload a waste image", type=["jpg", "jpeg", "png"], key="tab3_upload")
            if uploaded_file is not None:
                st.image(uploaded_file, caption="Uploaded Waste Image", use_column_width=True)
                if st.button("Classify Image", key="tab3_img_btn"):
                    classify_image(uploaded_file)

    # --- NEW: Awareness & Education Tab ---
    with tab4:
        st.markdown("### 🌟 Waste Management Awareness & Education")
        st.write("Get educational tips and test your knowledge with fun quizzes!")

        awareness_col1, awareness_col2 = st.columns(2)

        with awareness_col1:
            st.subheader("💡 Get Awareness Tip")
            tip_context = st.text_input(
                "What did you recycle/do?",
                placeholder="e.g., recycled plastic bottle, composted food waste",
                key="tip_context"
            )
            user_id = st.text_input("User ID (optional)", placeholder="e.g., user_123", key="user_id")

            if st.button("✨ Get Tip", key="tip_btn"):
                if tip_context.strip():
                    get_awareness_tip(tip_context, user_id)
                else:
                    st.warning("Please describe what you recycled or did")

        with awareness_col2:
            st.subheader("🧠 Take a Quiz")
            quiz_topic = st.selectbox(
                "Choose quiz topic",
                ["general", "plastic", "composting", "recycling", "ewaste", "paper", "metal"],
                help="Select a waste management topic to test your knowledge",
                key="quiz_topic"
            )

            if st.button("🎯 Start Quiz", key="quiz_btn"):
                get_quiz_question(quiz_topic)

        # Display quiz results if available - FIXED THE ERROR
        if st.session_state.get('quiz_data') is not None:
            display_quiz_results()


# --- Recycling Guide Functions (unchanged) ---
def get_recycling_guide(waste_category, location):
    try:
        payload = {"waste_category": waste_category}
        if location:
            payload["user_location"] = location
        response = requests.post(
            "http://localhost:8000/api/recycling",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            display_results(data, waste_category)
        else:
            handle_error(response)
    except requests.exceptions.ConnectionError:
        st.error("⚠️ Cannot connect to the backend. Is FastAPI running?")
    except Exception as e:
        st.error(f"❌ Unexpected error: {str(e)}")


def display_results(data, waste_category):
    st.success(f"✅ Recycling guide for {waste_category}")
    col1, col2 = st.columns([1, 2])
    with col1:
        st.markdown('<div class="success-box">', unsafe_allow_html=True)
        st.markdown(f"**📦 Material Type:** {data.get('category', waste_category).title()}")
        st.markdown("**📊 Status:** Analysis Complete")
        st.markdown("</div>", unsafe_allow_html=True)
        if st.button("📋 Copy to Clipboard", key="copy_btn"):
            st.session_state.copied_text = data['guide']
            st.success("Copied!")
    with col2:
        st.markdown("### 📝 Recycling Guide")
        st.markdown('<div class="guide-box">', unsafe_allow_html=True)
        st.markdown(data['guide'])
        st.markdown("</div>", unsafe_allow_html=True)


def handle_error(response):
    try:
        error_data = response.json()
        st.error(f"❌ Error: {error_data.get('detail', 'Unknown error')}")
    except json.JSONDecodeError:
        st.error(f"❌ Server Error (HTTP {response.status_code})")


# --- Classification Functions (unchanged) ---
def classify_text(text_input):
    try:
        response = requests.post(
            "http://localhost:8000/api/classify/text",
            json={"text_description": text_input},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            result = response.json()
            st.success(f"**Category:** {result['category']}")
        else:
            handle_error(response)
    except Exception as e:
        st.error(f"❌ Text classification failed: {str(e)}")


def classify_image(uploaded_file):
    try:
        files = {"file": (uploaded_file.name, uploaded_file, uploaded_file.type)}
        response = requests.post("http://localhost:8000/api/classify/image", files=files)
        if response.status_code == 200:
            result = response.json()
            st.success(f"**Category:** {result['category']}")
        else:
            handle_error(response)
    except Exception as e:
        st.error(f"❌ Image classification failed: {str(e)}")


# --- NEW: Awareness Functions ---

def get_awareness_tip(context, user_id=None):
    try:
        payload = {"context": context}
        if user_id:
            payload["user_id"] = user_id

        response = requests.post(
            "http://localhost:8000/api/awareness/tip",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            display_awareness_tip(data)
        else:
            handle_error(response)

    except requests.exceptions.ConnectionError:
        st.error("⚠️ Cannot connect to the awareness service.")
    except Exception as e:
        st.error(f"❌ Failed to get awareness tip: {str(e)}")


def display_awareness_tip(data):
    st.markdown('<div class="tip-box">', unsafe_allow_html=True)
    st.markdown(f"### 💫 Awareness Tip")
    st.markdown(f"**Context:** {data.get('context', 'General recycling')}")
    st.markdown(f"**Message:** {data.get('message', '')}")
    st.markdown("</div>", unsafe_allow_html=True)


def get_quiz_question(topic):
    try:
        payload = {"topic": topic}

        response = requests.post(
            "http://localhost:8000/api/awareness/quiz",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            st.session_state.quiz_data = data
            st.session_state.quiz_answered = False
            st.session_state.selected_answer = None
            st.rerun()
        else:
            handle_error(response)

    except requests.exceptions.ConnectionError:
        st.error("⚠️ Cannot connect to the quiz service.")
    except Exception as e:
        st.error(f"❌ Failed to get quiz question: {str(e)}")


def display_quiz_results():
    quiz_data = st.session_state.get('quiz_data')
    if quiz_data is None:
        st.warning("📝 No quiz data available. Please generate a quiz first.")
        return

    st.markdown('<div class="quiz-box">', unsafe_allow_html=True)
    st.markdown(f"### 🧠 Quiz: {quiz_data.get('topic', 'General Knowledge').title()}")
    st.markdown(f"**Question:** {quiz_data.get('question', '')}")

    options = quiz_data.get('options', {})

    if not st.session_state.get('quiz_answered', False):
        for option, text in options.items():
            if st.button(f"{option}: {text}", key=f"opt_{option}"):
                st.session_state.selected_answer = option
                st.session_state.quiz_answered = True
                st.rerun()
    else:
        selected = st.session_state.selected_answer
        correct = quiz_data.get('correct_answer')

        for option, text in options.items():
            css_class = ""
            if option == correct:
                css_class = "correct-answer"
            elif option == selected and option != correct:
                css_class = "wrong-answer"

            st.markdown(f'<div class="quiz-option {css_class}"><strong>{option}:</strong> {text}</div>',
                        unsafe_allow_html=True)

        if selected == correct:
            st.success("✅ Correct! " + quiz_data.get('explanation', ''))
        else:
            st.error(f"❌ Incorrect. The correct answer is {correct}. " + quiz_data.get('explanation', ''))

        if st.button("🔄 New Quiz", key="new_quiz"):
            del st.session_state.quiz_data
            del st.session_state.quiz_answered
            del st.session_state.selected_answer
            st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)


# --- App Run ---
if __name__ == "__main__":
    # Initialize session state variables safely
    if 'copied_text' not in st.session_state:
        st.session_state.copied_text = ""
    if 'quiz_data' not in st.session_state:
        st.session_state.quiz_data = None
    if 'quiz_answered' not in st.session_state:
        st.session_state.quiz_answered = False
    if 'selected_answer' not in st.session_state:
        st.session_state.selected_answer = None

    main()
    st.markdown("---")
    st.markdown("<div style='text-align: center; color: #666;'>♻️ Eco AI Waste Manager - Awareness & Education</div>",
                unsafe_allow_html=True)