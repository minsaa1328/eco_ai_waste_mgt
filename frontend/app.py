import streamlit as st
import requests
import json

st.set_page_config(
    page_title="♻️ Eco AI Waste Manager",
    page_icon="♻️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""...""", unsafe_allow_html=True)  # keep your CSS from before


def main():
    # Header
    st.markdown('<h1 class="main-header">♻️ Eco AI Waste Manager</h1>', unsafe_allow_html=True)
    st.markdown("### Multi-Agent AI for classification, recycling guidance, and awareness")

    # Tabs
    tab1, tab2, tab3, tab4 = st.tabs([
        "🧴 Recycling Guide",
        "🧪 Waste Classification",
        "🌟 Awareness & Education",
        "🤖 Orchestrator (End-to-End)"
    ])

    # --- Recycling Guide ---
    with tab1:
        st.markdown("### 🧴 Get Detailed Recycling Instructions")
        waste_category = st.selectbox(
            "Select Waste Type",
            ["plastic", "paper", "glass", "metal", "cardboard", "electronics", "organic"],
            help="Choose the type of waste material",
            key="tab1_waste"
        )
        location = st.text_input("📍 Location (Optional)", placeholder="e.g., Colombo", key="tab1_loc")
        if st.button("♻️ Get Recycling Guide", type="primary", key="tab1_btn"):
            get_recycling_guide(waste_category, location)

    # --- Classification Tab ---
    with tab2:
        st.markdown("### 🧪 AI-Powered Waste Classification")
        st.write("Classify waste into **recyclable, organic, hazardous, or general**")

        col1, col2 = st.columns(2)

        with col1:
            st.subheader("🔤 Classify by Text")
            text_input = st.text_input("Enter waste description", placeholder="e.g., banana peel, plastic bottle")
            if st.button("Classify Text", key="tab2_text_btn"):
                if text_input.strip():
                    classify_text(text_input)
                else:
                    st.warning("Please enter a description.")

        with col2:
            st.subheader("🖼️ Classify by Image")
            uploaded_file = st.file_uploader("Upload a waste image", type=["jpg", "jpeg", "png"])
            if uploaded_file is not None:
                st.image(uploaded_file, caption="Uploaded Waste Image", use_column_width=True)
                if st.button("Classify Image", key="tab2_img_btn"):
                    classify_image(uploaded_file)

    # --- Awareness & Education Tab ---
    with tab3:
        st.markdown("### 🌟 Awareness & Education")
        awareness_col1, awareness_col2 = st.columns(2)

        with awareness_col1:
            tip_context = st.text_input(
                "What did you recycle/do?",
                placeholder="e.g., recycled plastic bottle, composted food waste",
                key="tip_context"
            )
            if st.button("✨ Get Awareness Tip", key="tip_btn"):
                if tip_context.strip():
                    get_awareness_tip(tip_context)
                else:
                    st.warning("Please describe your action")

        with awareness_col2:
            quiz_topic = st.selectbox(
                "Choose quiz topic",
                ["general", "plastic", "composting", "recycling", "ewaste", "paper", "metal"],
                key="quiz_topic"
            )
            if st.button("🎯 Start Quiz", key="quiz_btn"):
                get_quiz_question(quiz_topic)

        if st.session_state.get('quiz_data') is not None:
            display_quiz_results()

    # --- Orchestrator Tab ---
    with tab4:
        st.markdown("### 🤖 End-to-End Orchestrator")
        st.write("Run the full AI workflow with either text OR image input")

        input_mode = st.radio("Choose input type", ["Text", "Image"], key="orc_mode")

        location = st.text_input("📍 Location (optional)", placeholder="e.g., Colombo", key="orc_loc")

        if input_mode == "Text":
            item = st.text_input("Enter waste item", placeholder="e.g., plastic bottle, banana peel", key="orc_item")
            if st.button("🚀 Run Orchestrator (Text)", key="orc_btn_text"):
                if item.strip():
                    run_orchestrator_text(item, location)
                else:
                    st.warning("Please enter a waste item.")

        elif input_mode == "Image":
            uploaded_file = st.file_uploader("Upload a waste image", type=["jpg", "jpeg", "png"], key="orc_upload")
            if uploaded_file is not None:
                st.image(uploaded_file, caption="Uploaded Waste Image", use_column_width=True)
                if st.button("🚀 Run Orchestrator (Image)", key="orc_btn_img"):
                    run_orchestrator_image(uploaded_file, location)


# --- Recycling (via orchestrator) ---
def get_recycling_guide(waste_category, location=None):
    payload = {"task": "recycle", "payload": {"waste_category": waste_category}}
    if location:
        payload["payload"]["location"] = location
    call_orchestrator(payload, success_handler=display_recycling)


def display_recycling(data):
    if "recycling_guide" not in data:
        st.error("No guide returned")
        return
    st.success("✅ Recycling Guide Ready")
    st.markdown('<div class="guide-box">', unsafe_allow_html=True)
    st.markdown(data["recycling_guide"])
    st.markdown("</div>", unsafe_allow_html=True)


# --- Classification (via orchestrator) ---
def classify_text(text_input):
    payload = {"task": "classify_text", "payload": {"item": text_input}}
    call_orchestrator(payload, success_handler=lambda d: st.success(f"**Category:** {d['classification']}"))


def classify_image(uploaded_file):
    try:
        files = {"file": (uploaded_file.name, uploaded_file, uploaded_file.type)}
        response = requests.post("http://localhost:8000/api/orchestrator/orchestrate/image", files=files)
        if response.status_code == 200:
            data = response.json()
            st.success(f"**Category:** {data.get('classification', 'Unknown')}")

            if "recycling_guide" in data:
                display_recycling(data)
            if "awareness_tip" in data:
                display_awareness_tip(data)
        else:
            handle_error(response)
    except Exception as e:
        st.error(f"❌ Image classification failed: {str(e)}")


# --- Awareness (via orchestrator) ---
def get_awareness_tip(context):
    payload = {"task": "awareness", "payload": {"context": context}}
    call_orchestrator(payload, success_handler=display_awareness_tip)


def display_awareness_tip(data):
    if "awareness_tip" not in data:
        st.error("No tip returned")
        return
    st.markdown('<div class="tip-box">', unsafe_allow_html=True)
    st.markdown(f"### 💫 Awareness Tip")
    st.markdown(data["awareness_tip"])
    st.markdown("</div>", unsafe_allow_html=True)


def get_quiz_question(topic):
    payload = {"task": "quiz", "payload": {"topic": topic}}
    call_orchestrator(payload, success_handler=lambda d: store_quiz(d))


def store_quiz(data):
    st.session_state.quiz_data = json.loads(data["quiz"]) if isinstance(data["quiz"], str) else data["quiz"]
    st.session_state.quiz_answered = False
    st.session_state.selected_answer = None
    st.rerun()


def display_quiz_results():
    quiz_data = st.session_state.get('quiz_data')
    if not quiz_data:
        st.warning("No quiz loaded")
        return

    st.markdown('<div class="quiz-box">', unsafe_allow_html=True)
    st.markdown(f"### 🧠 Quiz: {quiz_data.get('topic', 'General')}")
    st.markdown(f"**Question:** {quiz_data.get('question', '')}")

    options = quiz_data.get('options', {})
    if not st.session_state.get('quiz_answered', False):
        for opt, text in options.items():
            if st.button(f"{opt}: {text}", key=f"quiz_opt_{opt}"):
                st.session_state.selected_answer = opt
                st.session_state.quiz_answered = True
                st.rerun()
    else:
        sel = st.session_state.selected_answer
        correct = quiz_data.get('correct_answer')
        for opt, text in options.items():
            css = "correct-answer" if opt == correct else ("wrong-answer" if opt == sel else "")
            st.markdown(f'<div class="quiz-option {css}"><strong>{opt}:</strong> {text}</div>',
                        unsafe_allow_html=True)

        if sel == correct:
            st.success("✅ Correct! " + quiz_data.get('explanation', ''))
        else:
            st.error(f"❌ Incorrect. Correct: {correct}. " + quiz_data.get('explanation', ''))

        if st.button("🔄 New Quiz", key="new_quiz"):
            del st.session_state.quiz_data
            st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)


# --- Orchestrator End-to-End ---
def run_orchestrator_text(item, location=None):
    payload = {"task": "end_to_end", "payload": {"item": item}}
    if location:
        payload["payload"]["location"] = location
    call_orchestrator(payload, success_handler=display_orchestrator)


def run_orchestrator_image(uploaded_file, location=None):
    try:
        files = {"file": (uploaded_file.name, uploaded_file, uploaded_file.type)}
        params = {}
        if location:
            params["location"] = location

        response = requests.post(
            "http://localhost:8000/api/orchestrator/orchestrate/image",
            files=files,
            params=params
        )

        if response.status_code == 200:
            data = response.json()
            display_orchestrator(data)
        else:
            handle_error(response)

    except Exception as e:
        st.error(f"❌ Orchestrator image flow failed: {str(e)}")


def display_orchestrator(data):
    st.success("✅ End-to-End Workflow Complete")
    if "classification" in data:
        st.info(f"**Classification:** {data['classification']}")
    if "recycling_guide" in data:
        display_recycling(data)
    if "awareness_tip" in data:
        display_awareness_tip(data)


# --- Common helper ---
def call_orchestrator(payload, success_handler):
    try:
        response = requests.post(
            "http://localhost:8000/api/orchestrator/orchestrate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            success_handler(data)
        else:
            handle_error(response)
    except requests.exceptions.ConnectionError:
        st.error("⚠️ Cannot connect to backend")
    except Exception as e:
        st.error(f"❌ Error: {str(e)}")


def handle_error(response):
    try:
        err = response.json()
        st.error(f"❌ {err.get('detail', 'Unknown error')}")
    except Exception:
        st.error(f"❌ Server Error {response.status_code}")


# --- App Run ---
if __name__ == "__main__":
    if 'quiz_data' not in st.session_state:
        st.session_state.quiz_data = None
    if 'quiz_answered' not in st.session_state:
        st.session_state.quiz_answered = False
    if 'selected_answer' not in st.session_state:
        st.session_state.selected_answer = None

    main()
    st.markdown("---")
    st.markdown("<div style='text-align: center; color: #666;'>♻️ Eco AI Waste Manager</div>",
                unsafe_allow_html=True)
