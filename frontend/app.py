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
    st.markdown("### Get instant recycling guidance for any waste material")

    # Create tabs for different functionalities
    tab1, tab2 = st.tabs(["🧴 Get Recycling Guide", "📋 Quick Guide (Text)"])

    with tab1:
        st.markdown("### 🧴 Get Detailed Recycling Instructions")
        st.markdown("Enter the type of waste material to get specific recycling guidance")

        col1, col2 = st.columns([1, 1])

        with col1:
            waste_category = st.selectbox(
                "Select Waste Type",
                ["plastic", "paper", "glass", "metal", "cardboard", "electronics", "organic"],
                help="Choose the type of waste material"
            )

            location = st.text_input(
                "📍 Your Location (Optional)",
                placeholder="e.g., New York, USA",
                help="For location-specific recycling guidelines"
            )

            if st.button("♻️ Get Recycling Guide", type="primary"):
                get_recycling_guide(waste_category, location)

        with col2:
            st.info("""
            **💡 Tips:**
            - Select the waste material type from the dropdown
            - Add your location for region-specific guidance
            - Get detailed recycling instructions instantly
            """)

    with tab2:
        st.markdown("### 📋 Quick Recycling Lookup")
        st.markdown("Quickly get recycling info using direct text input")

        quick_waste = st.text_input(
            "Enter waste material",
            placeholder="e.g., plastic bottles, aluminum cans, etc.",
            key="quick_input"
        )

        if st.button("🔍 Quick Search", key="quick_btn"):
            if quick_waste:
                get_recycling_guide(quick_waste, None)
            else:
                st.warning("Please enter a waste material type")


def get_recycling_guide(waste_category, location):
    """Call the recycling API and display results"""
    try:
        with st.spinner(f"🧠 Getting recycling guide for {waste_category}..."):
            # Prepare the request data
            payload = {"waste_category": waste_category}
            if location:
                payload["user_location"] = location

            # Make API call
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
        st.error("""
        **⚠️ Cannot connect to the server**
        - Make sure the backend is running on port 8000
        - Run this command: `python main.py` in your backend directory
        """)
    except requests.exceptions.Timeout:
        st.error("⏱️ The request timed out. Please try again.")
    except Exception as e:
        st.error(f"❌ Unexpected error: {str(e)}")


def display_results(data, waste_category):
    """Display the recycling guide results"""
    st.success(f"**✅ Successfully generated recycling guide for {waste_category}**")

    # Main results columns
    col1, col2 = st.columns([1, 2])

    with col1:
        st.markdown('<div class="success-box">', unsafe_allow_html=True)
        st.markdown(f"**📦 Material Type:** {data.get('category', waste_category).title()}")
        st.markdown("**📊 Status:** Analysis Complete")
        st.markdown("</div>", unsafe_allow_html=True)

        # Quick actions
        st.markdown("### 🚀 Quick Actions")
        if st.button("📋 Copy to Clipboard", key="copy_btn"):
            st.session_state.copied_text = data['guide']
            st.success("Copied to clipboard!")

        if st.button("🔄 Analyze Another Material", key="refresh_btn"):
            st.rerun()

    with col2:
        st.markdown("### 📝 Recycling Guide")
        st.markdown('<div class="guide-box">', unsafe_allow_html=True)
        st.markdown(data['guide'])
        st.markdown("</div>", unsafe_allow_html=True)

    # Additional information
    with st.expander("ℹ️ About This Guidance", expanded=False):
        st.info("""
        **How this works:**
        - AI-powered recycling guidance based on waste type
        - Provides preparation steps, disposal methods, and common mistakes
        - Includes environmental impact information
        - Location-specific advice when provided
        """)


def handle_error(response):
    """Handle different error responses"""
    try:
        error_data = response.json()
        error_detail = error_data.get('detail', {})

        if isinstance(error_detail, dict):
            st.error(f"""
            **❌ Error: {error_detail.get('error_type', 'Unknown Error')}**
            {error_detail.get('detail', 'No details provided')}
            """)
        else:
            st.error(f"**❌ Server Error:** {error_detail}")

    except json.JSONDecodeError:
        st.error(f"""
        **❌ Server Error (HTTP {response.status_code})**
        The server returned an invalid response. Please check if the backend is running properly.
        """)


if __name__ == "__main__":
    # Initialize session state
    if 'copied_text' not in st.session_state:
        st.session_state.copied_text = ""

    main()

    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666;'>
        <p>♻️ <strong>Eco AI Waste Manager</strong> - Powered by FastAPI & Streamlit</p>
        <p>🌍 Making recycling easier and more accessible</p>
    </div>
    """, unsafe_allow_html=True)