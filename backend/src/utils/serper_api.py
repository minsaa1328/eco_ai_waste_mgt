import requests
import os

def search_serper(payload):
    API_KEY = os.getenv("SERPER_API_KEY")
    headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json"}

    try:
        response = requests.post("https://google.serper.dev/search", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

        sources = []

        # Organic results
        for item in data.get("organic", [])[:3]:  # take top 3
            sources.append({
                "title": item.get("title"),
                "link": item.get("link"),
                "snippet": item.get("snippet")
            })

        # Related questions
        for item in data.get("related_questions", [])[:2]:
            sources.append({
                "title": item.get("question"),
                "link": item.get("link", "N/A"),
                "snippet": item.get("snippet", "")
            })

        # Knowledge graph
        if data.get("knowledge_graph"):
            kg = data["knowledge_graph"]
            sources.append({
                "title": kg.get("title"),
                "link": kg.get("website", "N/A"),
                "snippet": kg.get("description", "")
            })

        if not sources:
            return {"summary": "No results found from Serper API.", "sources": []}

        return {"summary": sources[0]["snippet"], "sources": sources}

    except Exception as e:
        return {"summary": f"Error querying Serper API: {e}", "sources": []}
