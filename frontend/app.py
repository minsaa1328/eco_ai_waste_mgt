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


def main():
    # Header
    st.markdown('<h1 class="main-header">♻️ Eco AI Waste Manager</h1>', unsafe_allow_html=True)
    st.markdown("### Get instant recycling guidance or waste classification")

    # Tabs
    tab1, tab2, tab3 = st.tabs([
        "🧴 Get Recycling Guide",
        "📋 Quick Guide (Text)",
        "🧪 Waste Classification"
    ])

    # --- Recycling Guide (existing) ---
    with tab1:
        st.markdown("### 🧴 Get Detailed Recycling Instructions")
        col1, col2 = st.columns([1, 1])
        with col1:
            waste_category = st.selectbox(
                "Select Waste Type",
                ["plastic", "paper", "glass", "metal", "cardboard", "electronics", "organic"],
                help="Choose the type of waste material"
            )
            location = st.text_input("📍 Your Location (Optional)", placeholder="e.g., New York, USA")
            if st.button("♻️ Get Recycling Guide", type="primary"):
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
        quick_waste = st.text_input("Enter waste material", placeholder="e.g., plastic bottles, aluminum cans")
        if st.button("🔍 Quick Search", key="quick_btn"):
            if quick_waste:
                get_recycling_guide(quick_waste, None)
            else:
                st.warning("Please enter a waste material type")

    # --- New Classification Tab ---
    with tab3:
        st.markdown("### 🧪 AI-Powered Waste Classification")
        st.write("Classify waste into **recyclable, organic, hazardous, or general**")

        col1, col2 = st.columns(2)

        # Text classification
        with col1:
            st.subheader("🔤 Classify by Text")
            text_input = st.text_input("Enter waste description", placeholder="e.g., banana peel, plastic bottle")
            if st.button("Classify Text", key="classify_text_btn"):
                if text_input.strip():
                    classify_text(text_input)
                else:
                    st.warning("Please enter a description.")

        # Image classification
        with col2:
            st.subheader("🖼️ Classify by Image")
            uploaded_file = st.file_uploader("Upload a waste image", type=["jpg", "jpeg", "png"])
            if uploaded_file is not None:
                st.image(uploaded_file, caption="Uploaded Waste Image", use_column_width=True)
                if st.button("Classify Image", key="classify_img_btn"):
                    classify_image(uploaded_file)


# --- Recycling Guide Functions (unchanged) ---
def get_recycling_guide(waste_category, location):
    try:
        payload = {"waste_category": waste_category}
        if location:
            payload["user_location"] = location
        response = requests.post(
            "http://localhost:8000/api/v1/recycling",
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


# --- New Classification Functions ---
def classify_text(text_input):
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/classify/text",
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
        response = requests.post("http://localhost:8000/api/v1/classify/image", files=files)
        if response.status_code == 200:
            result = response.json()
            st.success(f"**Category:** {result['category']}")
        else:
            handle_error(response)
    except Exception as e:
        st.error(f"❌ Image classification failed: {str(e)}")


# --- App Run ---
if __name__ == "__main__":
    if 'copied_text' not in st.session_state:
        st.session_state.copied_text = ""
    main()
    st.markdown("---")
    st.markdown("<div style='text-align: center; color: #666;'>♻️ Eco AI Waste Manager</div>", unsafe_allow_html=True)
