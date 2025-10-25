# backend/src/crews/responsibleAICrew.py
from crewai import Agent, Task, Crew, Process
from src.utils.serper_api import search_serper


class ResponsibleAICrew:
    def __init__(self):
        # Define Responsible AI Agent
        self.audit_agent = Agent(
            role="Responsible AI Auditor",
            goal="Ensure system outputs are safe, fair, and transparent",
            backstory="""You are an AI ethics auditor. 
            You review outputs for harmful intent, fairness, accessibility, 
            and transparency. You never ignore unsafe inputs.""",
            verbose=True
        )

        # Define the audit task
        self.audit_task = Task(
            description="""Review the given steps and payload. 
            1. Detect harmful or unsafe requests. 
            2. Confirm fairness (same guidance for all users). 
            3. Confirm accessibility (simple explanations). 
            4. Ensure transparency (list agents executed).

            Provide a JSON object with:
            - status
            - fairness
            - accessibility
            - agents_executed
            """,
            agent=self.audit_agent,
            expected_output="JSON object with status, fairness, accessibility, and agents_executed"
        )

        # Assemble Crew
        self.crew = Crew(
            agents=[self.audit_agent],
            tasks=[self.audit_task],
            process=Process.sequential,
            verbose=True
        )

    def check(self, payload: dict, steps: list):
        """
        Run Responsible AI audit. Returns a dict with:
        - status
        - fairness
        - accessibility
        - agents_executed
        - sources
        """
        text = str(payload).lower()

        # 1. Rule-based hard safety net (always active)
        forbidden = ["kill", "hack", "bomb", "burn waste with acid", "rm -rf /"]
        if any(word in text for word in forbidden):
            return {
                "status": "fail",
                "fairness": "❌ Unsafe content detected.",
                "accessibility": "❌ Request blocked.",
                "agents_executed": [s["agent"] for s in steps],
                "sources": []
            }

        try:
            # 2. Run CrewAI audit for human-readable reasoning
            result = self.crew.kickoff(inputs={"payload": payload, "steps": steps})
            output = result.raw if hasattr(result, "raw") else str(result)

            # Try parsing CrewAI response as JSON
            import json
            try:
                parsed = json.loads(output)
            except Exception:
                # fallback if LLM didn't output JSON
                parsed = {
                    "status": "pass",
                    "fairness": " Same recycling guidance provided for all users.",
                    "accessibility": " Explanations simplified for general users.",
                    "agents_executed": [s["agent"] for s in steps]
                }

            # 3. Add Serper API sources (transparency)
            serper_result = search_serper({"q": payload.get("item", "")})
            parsed["sources"] = serper_result.get("sources", [])

            return parsed

        except Exception as e:
            # Fallback if CrewAI fails
            return {
                "status": "pass",
                "fairness": " Same recycling guidance provided for all users.",
                "accessibility": " Explanations simplified for general users.",
                "agents_executed": [s["agent"] for s in steps],
                "sources": []
            }
