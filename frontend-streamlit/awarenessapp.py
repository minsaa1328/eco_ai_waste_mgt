
import streamlit as st
import requests

st.set_page_config(
    page_title="🌱 Waste Quiz",
    page_icon="🌱",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        color: #2E8B57;
        text-align: center;
        margin-bottom: 2rem;
    }
    .message-box {
        background-color: #19221C;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #4CAF50;
        margin-top: 1rem;
        font-size: 1.2rem;
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
</style>
""", unsafe_allow_html=True)

st.markdown('<h1 class="main-header">🌱 Eco Waste Quiz</h1>', unsafe_allow_html=True)
st.markdown("Get instant tips, facts, or mini-quizzes about waste management and recycling.")

# Choose request type
request_type = st.radio("Choose request type:", ("POST - Detailed Tip", "GET - Quick Tip"))

if st.button("💡 Get Quiz Message"):
    try:
        if request_type.startswith("POST"):
            response = requests.post("http://localhost:8000/awareness/")
        else:
            response = requests.get("http://localhost:8000/awareness/quick")

        if response.status_code == 200:
            data = response.json()
            st.markdown(f'<div class="message-box">{data["message"]}</div>', unsafe_allow_html=True)
        else:
            st.error(f"❌ Error {response.status_code}: {response.text}")

    except requests.exceptions.ConnectionError:
        st.error("⚠️ Cannot connect to the server. Make sure FastAPI backend is running on port 8000.")
    except Exception as e:
        st.error(f"❌ Unexpected error: {str(e)}")

st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    🌱 Eco Waste Quiz - Powered by FastAPI & Streamlit
</div>
""", unsafe_allow_html=True)
