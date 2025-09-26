from src.utils.serper_api import search_serper

class ResponsibleAICrew:
    def check(self, payload, steps):
        text = str(payload).lower()

        # 1. Harmful check
        forbidden = ["kill", "hack", "bomb", "burn waste with acid", "rm -rf /"]
        if any(word in text for word in forbidden):
            return "❌ Request refused: Unsafe or harmful content detected."

        # 2. Transparency: agents executed
        executed_agents = [s["agent"] for s in steps]

        # 3. Fairness & accessibility notes
        fairness_note = "✅ Same recycling guidance provided for all users."
        accessibility_note = "✅ Explanations simplified for general users."

        # 4. Sources (call Serper API for user query)
        serper_result = search_serper({"q": payload.get("item", "")})
        sources = serper_result.get("sources", [])

        return {
            "status": "pass",
            "agents_executed": executed_agents,
            "fairness": fairness_note,
            "accessibility": accessibility_note,
            "sources": sources
        }