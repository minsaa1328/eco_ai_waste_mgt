import streamlit as st
import requests

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
.classifier { background-color: #3498db; }   /* Blue */
.recycling  { background-color: #27ae60; }   /* Green */
.awareness  { background-color: #f39c12; }   /* Orange */
.quiz       { background-color: #9b59b6; }   /* Purple */
.unknown    { background-color: #7f8c8d; }   /* Gray */
</style>
""", unsafe_allow_html=True)


def main():
    st.markdown('<h1 class="main-header">♻️ Eco AI Waste Manager</h1>', unsafe_allow_html=True)
    st.markdown("### Multi-Agent Orchestrator for classification, recycling guidance, awareness, and quizzes")

    # Input type choice
    input_mode = st.radio("Choose input type", ["Text", "Image"], key="orc_mode")

    # Task selection
    needs = st.multiselect(
        "What do you want?",
        ["classify", "guide", "awareness", "quiz"],
        default=["classify", "guide", "awareness"]
    )

    if input_mode == "Text":
        item = st.text_input("Enter waste item", placeholder="e.g., plastic bottle, banana peel")
        location = st.text_input("📍 Location (optional)", placeholder="e.g., Colombo", key="loc_text")
        if st.button("🚀 Run Orchestrator (Text)"):
            if item.strip():
                run_orchestrator_text(item, needs, location)
            else:
                st.warning("Please enter a waste item.")

    elif input_mode == "Image":
        uploaded_file = st.file_uploader("Upload a waste image", type=["jpg", "jpeg", "png"])
        location = st.text_input("📍 Location (optional)", placeholder="e.g., Colombo", key="loc_img")
        if uploaded_file is not None:
            st.image(uploaded_file, caption="Uploaded Waste Image", use_column_width=True)
            if st.button("🚀 Run Orchestrator (Image)"):
                run_orchestrator_image(uploaded_file, needs, location)


# --- Backend Calls ---
def run_orchestrator_text(item, needs, location=None):


    if "classify" not in needs:
        needs = ["classify"] + needs

    payload = {
        "task": "custom",
        "need": needs,
        "payload": {"item": item}
    }
    if location:
        payload["payload"]["location"] = location
    call_orchestrator(f"{API_BASE}/handle", payload)


def run_orchestrator_image(uploaded_file, needs, location=None):
    try:

        if "classify" not in needs:
            needs = ["classify"] + needs

        files = {"file": (uploaded_file.name, uploaded_file, uploaded_file.type)}
        params = {}
        if location:
            params["location"] = location
        if needs:
            params["needs"] = ",".join(needs)  # <-- FIXED: send needs

        response = requests.post(f"{API_BASE}/handle/image", files=files, params=params, timeout=60)
        if response.status_code == 200:
            data = response.json()
            display_steps(data)
        else:
            handle_error(response)
    except Exception as e:
        st.error(f"❌ Orchestrator image flow failed: {str(e)}")


# --- Display Helpers ---
def call_orchestrator(url, payload):
    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        if response.status_code == 200:
            data = response.json()
            display_steps(data)
        else:
            handle_error(response)
    except requests.exceptions.ConnectionError:
        st.error("⚠️ Cannot connect to backend")
    except Exception as e:
        st.error(f"❌ Error: {str(e)}")


def display_steps(data):
    if "steps" not in data:
        st.error("⚠️ No steps returned from orchestrator")
        return

    st.success(f"✅ Task: {data.get('task', 'unknown')}")
    for step in data["steps"]:
        agent = step.get("agent", "unknown").lower()
        output = step.get("output", "No output")
        st.markdown(
            f"<div class='step-box {agent}'><b>{agent.capitalize()}:</b> {output}</div>",
            unsafe_allow_html=True
        )


def handle_error(response):
    try:
        err = response.json()
        st.error(f"❌ {err.get('detail', 'Unknown error')}")
    except Exception:
        st.error(f"❌ Server Error {response.status_code}")


# --- App Run ---
if __name__ == "__main__":
    main()
    st.markdown("---")
    st.markdown("<div style='text-align: center; color: #666;'>♻️ Eco AI Waste Manager</div>",
                unsafe_allow_html=True)
