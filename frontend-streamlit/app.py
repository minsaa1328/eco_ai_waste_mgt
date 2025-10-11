import streamlit as st
import requests
import json

# --- Page Config ---
st.set_page_config(
    page_title="♻️ Eco AI Waste Manager",
    page_icon="♻️",
    layout="wide",
    initial_sidebar_state="expanded"
)

API_BASE = "http://localhost:8000/api/orchestrator"

# --- Custom CSS ---
st.markdown("""
<style>
.step-box {
    border-radius: 12px;
    padding: 15px;
    margin: 10px 0;
    color: white;
    font-size: 16px;
    font-weight: 500;
}
.classifier    { background-color: #3498db; }   /* Blue */
.recycling     { background-color: #27ae60; }   /* Green */
.awareness     { background-color: #f39c12; }   /* Orange */
.quiz          { background-color: #9b59b6; }   /* Purple */
.responsible   { background-color: #2c3e50; }   /* Dark Gray */
.unknown       { background-color: #7f8c8d; }   /* Gray */

.quiz-option {
    background-color: #720808;
    padding: 0.8rem;
    margin: 0.5rem 0;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
}
.quiz-option:hover {
    background-color: #990404;
    transform: translateX(5px);
}
.correct-answer {
    background-color: #09A40E !important;
    border-left: 4px solid #4CAF50 !important;
}
.wrong-answer {
    background-color: #BA0718 !important;
    border-left: 4px solid #F44336 !important;
}
.quiz-button {
    width: 100%;
    margin: 0.2rem 0;
    text-align: left;
    background-color: #720808;
    color: white;
    border: none;
    padding: 0.8rem;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
}
.quiz-button:hover {
    background-color: #990404;
    transform: translateX(5px);
}
</style>
""", unsafe_allow_html=True)


# --- Quiz Functions ---
def submit_quiz_answer(quiz_data, selected_answer, quiz_key):
    """Submit answer to quiz endpoint"""
    try:
        payload = {
            "quiz_data": quiz_data,
            "selected_answer": selected_answer
        }

        response = requests.post(
            f"{API_BASE}/quiz/answer",
            json=payload,
            timeout=30
        )

        if response.status_code == 200:
            # Update session state
            st.session_state[quiz_key] = {
                'submitted': True,
                'selected_answer': selected_answer,
                'quiz_data': quiz_data,
                'result': response.json()
            }
            st.rerun()
        else:
            st.error("Failed to submit answer")

    except Exception as e:
        st.error(f"Error submitting answer: {e}")


def show_quiz_results(quiz_state):
    """Display quiz results"""
    quiz_data = quiz_state['quiz_data']
    selected = quiz_state['selected_answer']
    options = quiz_data.get('options', {})
    correct_answer = quiz_data.get('correct_answer', '')
    explanation = quiz_data.get('explanation', '')

    # Check if answer is correct
    is_correct = (selected == correct_answer)

    st.markdown("**Results:**")

    for option, text in options.items():
        css_class = ""
        if option == correct_answer:
            css_class = "correct-answer"
        elif option == selected:
            css_class = "wrong-answer"

        prefix = "✓ " if option == selected else ""
        st.markdown(f'<div class="quiz-option {css_class}"><strong>{prefix}{option}:</strong> {text}</div>',
                    unsafe_allow_html=True)

    if is_correct:
        st.success(f"✅ **Correct!** {explanation}")
    else:
        st.error(f"❌ **Incorrect.** Correct answer is **{correct_answer}**. {explanation}")


def display_quiz(quiz_data):
    """Display quiz - handle answers without re-running orchestrator"""
    st.markdown('<div class="step-box quiz">', unsafe_allow_html=True)
    st.markdown("**📝 Recycling Quiz**")

    # Parse quiz data
    if isinstance(quiz_data, str):
        try:
            quiz_data = json.loads(quiz_data)
        except json.JSONDecodeError:
            st.write(quiz_data)
            st.markdown('</div>', unsafe_allow_html=True)
            return

    if isinstance(quiz_data, dict):
        question = quiz_data.get('question', 'Quiz Question')
        options = quiz_data.get('options', {})
        correct_answer = quiz_data.get('correct_answer', '')
        explanation = quiz_data.get('explanation', '')

        # Create a unique key for this quiz
        quiz_key = f"quiz_{hash(question)}"

        # Initialize session state
        if quiz_key not in st.session_state:
            st.session_state[quiz_key] = {
                'submitted': False,
                'selected_answer': None,
                'quiz_data': quiz_data
            }

        quiz_state = st.session_state[quiz_key]

        # Display question
        st.markdown(f"**{question}**")

        # If not submitted, show options
        if not quiz_state['submitted']:
            st.markdown("**Select your answer:**")

            # Display options as buttons
            for option, text in options.items():
                if st.button(f"{option}: {text}", key=f"{quiz_key}_{option}"):
                    # Submit to QUIZ ANSWER endpoint (not main orchestrator)
                    submit_quiz_answer(quiz_data, option, quiz_key)

        else:
            # Show results
            show_quiz_results(quiz_state)

    st.markdown('</div>', unsafe_allow_html=True)


# --- Backend Calls ---
def run_orchestrator_text(item, needs, location=None):
    """Run orchestrator and return data (don't display directly)"""
    if "classify" not in needs:
        needs = ["classify"] + needs

    payload = {
        "task": "custom",
        "need": needs,
        "payload": {"item": item}
    }
    if location:
        payload["payload"]["location"] = location

    try:
        response = requests.post(
            f"{API_BASE}/handle",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        if response.status_code == 200:
            return response.json()  # Return data instead of displaying
        else:
            handle_error(response)
            return None
    except Exception as e:
        st.error(f"❌ Error: {str(e)}")
        return None


def run_orchestrator_image(uploaded_file, needs, location=None):
    """Run image orchestrator and return data"""
    try:
        if "classify" not in needs:
            needs = ["classify"] + needs

        files = {"file": (uploaded_file.name, uploaded_file, uploaded_file.type)}
        params = {"needs": ",".join(needs)}
        if location:
            params["location"] = location

        response = requests.post(f"{API_BASE}/handle/image", files=files, params=params, timeout=120)
        if response.status_code == 200:
            return response.json()  # Return data instead of displaying
        else:
            handle_error(response)
            return None

    except Exception as e:
        st.error(f"❌ Orchestrator image flow failed: {str(e)}")
        return None


# --- Display Functions ---
def display_steps(data):
    if not data or "steps" not in data:
        st.error("⚠️ No steps returned from orchestrator")
        return

    st.success(f"✅ Task: {data.get('task', 'unknown')}")

    for step in data["steps"]:
        agent = step.get("agent", "unknown").lower()
        output = step.get("output", "No output")

        # SPECIAL HANDLING: If this is a quiz, use the quiz display function
        if agent == "quiz":
            display_quiz(output)
        else:
            # Format dict outputs (for Responsible AI step)
            if isinstance(output, dict):
                formatted_output = ""
                for k, v in output.items():
                    if k == "sources" and isinstance(v, list):
                        formatted_output += "<b>Sources:</b><ul>"
                        for src in v:
                            title = src.get("title", "Untitled")
                            link = src.get("link", "#")
                            snippet = src.get("snippet", "")
                            formatted_output += f"<li><a href='{link}' target='_blank'>{title}</a> - {snippet}</li>"
                        formatted_output += "</ul>"
                    else:
                        formatted_output += f"<b>{k}:</b> {v}<br>"
            else:
                formatted_output = output

            st.markdown(
                f"<div class='step-box {agent}'><b>{agent.capitalize()}:</b><br>{formatted_output}</div>",
                unsafe_allow_html=True
            )


def handle_error(response):
    try:
        err = response.json()
        st.error(f"❌ {err.get('detail', 'Unknown error')}")
    except Exception:
        st.error(f"❌ Server Error {response.status_code}")


# --- Main App ---
def main():
    st.markdown('<h1 class="main-header">♻️ Eco AI Waste Manager</h1>', unsafe_allow_html=True)
    st.markdown(
        "### Multi-Agent Orchestrator for classification, recycling guidance, awareness, quizzes, and Responsible AI checks")

    # Input type choice
    input_mode = st.radio("Choose input type", ["Text", "Image"], key="orc_mode")

    # Task selection
    needs = st.multiselect(
        "What do you want?",
        ["classify", "guide", "awareness", "quiz"],
        default=["classify", "guide", "awareness"]
    )

    # --- Text Mode ---
    if input_mode == "Text":
        item = st.text_input("Enter waste item", placeholder="e.g., plastic bottle, banana peel")
        location = st.text_input("📍 Location (optional)", placeholder="e.g., Colombo", key="loc_text")

        if st.button("🚀 Run Orchestrator (Text)"):
            if item.strip():
                # Store the main result in session state to prevent re-running
                result = run_orchestrator_text(item, needs, location)
                if result:
                    st.session_state.main_result = result
                else:
                    st.error("Failed to get results from orchestrator")
            else:
                st.warning("Please enter a waste item.")

        # Display the main result if it exists
        if 'main_result' in st.session_state:
            display_steps(st.session_state.main_result)

    # --- Image Mode ---
    elif input_mode == "Image":
        uploaded_file = st.file_uploader("Upload a waste image", type=["jpg", "jpeg", "png"])
        location = st.text_input("📍 Location (optional)", placeholder="e.g., Colombo", key="loc_img")

        if uploaded_file is not None:
            st.image(uploaded_file, caption="Uploaded Waste Image", use_column_width=True)
            if st.button("🚀 Run Orchestrator (Image)"):
                # Store the main result in session state
                result = run_orchestrator_image(uploaded_file, needs, location)
                if result:
                    st.session_state.main_result = result
                else:
                    st.error("Failed to get results from orchestrator")

        # Display the main result if it exists
        if 'main_result' in st.session_state:
            display_steps(st.session_state.main_result)

    # Add a clear button to reset everything
    st.sidebar.markdown("---")
    if st.sidebar.button("🔄 Clear Results"):
        if 'main_result' in st.session_state:
            del st.session_state.main_result
        # Clear all quiz states
        for key in list(st.session_state.keys()):
            if key.startswith('quiz_'):
                del st.session_state[key]
        st.rerun()


# --- Run App ---
if __name__ == "__main__":
    main()
    st.markdown("---")
    st.markdown("<div style='text-align: center; color: #666;'>♻️ Eco AI Waste Manager</div>", unsafe_allow_html=True)