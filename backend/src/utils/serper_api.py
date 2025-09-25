import requests
import os

def search_serper(payload):


    API_KEY = os.getenv("SERPER_API_KEY")
    headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json"}

    try:
        response = requests.post("https://google.serper.dev/search", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

        # Check multiple sections
        for section in ["organic", "related_questions", "knowledge_graph"]:
            items = data.get(section, [])
            if items:
                snippet = items[0].get("snippet")
                if snippet:
                    return snippet
        return "No results found from Serper API."
    except Exception as e:
        return f"Error querying Serper API: {e}"
