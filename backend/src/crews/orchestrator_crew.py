from src.crews.awareness_crew import AwarenessCrew
from src.crews.classifier_crew import ClassifierCrew
from src.crews.recycling_crew import RecyclingCrew
from src.crews.responsibleAICrew import ResponsibleAICrew

class OrchestratorCrew:
    """
    Central orchestrator for all multi-agent communication.
    All single-agent tasks + multi-agent workflows run through here.
    """

    def __init__(self):
        self.awareness = AwarenessCrew()
        self.classifier = ClassifierCrew()
        self.recycling = RecyclingCrew()
        self.responsible = ResponsibleAICrew()

    def handle_task(self, task: str, payload: dict, needs: list[str] = None):
        """
        Unified orchestrator for all agents.
        Supports both single-task ('classify', 'recycle', etc.)
        and multi-agent 'custom' chains via 'needs'.
        """
        task = task.lower().strip()

        # --- Handle direct single-agent tasks first ---
        if task in ["classify", "classify_text", "classify_image"]:
            item = payload.get("item") or payload.get("image_path")
            category = self.classifier.classify(item, is_image=bool(payload.get("image_path")))
            return {"steps": [{"agent": "classifier", "output": category}]}

        if task == "recycle":
            category = payload.get("category") or "general"
            guide = self.recycling.get_guide(category, user_location=payload.get("location"))
            return {"steps": [{"agent": "recycling", "output": guide}]}

        if task == "awareness":
            context = payload.get("context") or "environmental sustainability"
            tip = self.awareness.get_awareness_tip(context)
            return {"steps": [{"agent": "awareness", "output": tip}]}

        # --- 🧠 Custom / Multi-Agent Chain ---
        if task == "custom":
            if not needs or len(needs) == 0:
                return {"error_type": "ValidationError", "detail": "Missing 'needs' list for custom task."}

            results = {"task": "custom", "steps": []}
            category = None
            context = payload.get("context")

            for need in needs:
                need = need.lower().strip()

                # 🟢 1. Classification
                if need in ["classify", "classifier"]:
                    item = payload.get("item") or payload.get("image_path")
                    if not item:
                        return {"error_type": "ValidationError", "detail": "Missing 'item' for classification."}
                    category = self.classifier.classify(item, is_image=bool(payload.get("image_path")))
                    results["steps"].append({"agent": "classifier", "output": category})
                    payload["category"] = category  # pass downstream

                # 🔵 2. Recycling guide
                elif need in ["recycle", "recycling", "guide"]:
                    if not category:
                        category = payload.get("category", "general")
                    guide = self.recycling.get_guide(category, user_location=payload.get("location"))
                    results["steps"].append({"agent": "recycling", "output": guide})
                    payload["guide"] = guide

                # 🟢 3. Awareness tip
                elif need in ["awareness", "educate", "tip"]:
                    if not context:
                        context = f"Information about {category or 'waste management'}"
                    tip = self.awareness.get_awareness_tip(context)
                    results["steps"].append({"agent": "awareness", "output": tip})

                # 🟣 4. Quiz generation
                elif need in ["quiz"]:
                    topic = category or payload.get("topic") or "recycling"
                    quiz = self.awareness.get_quiz_question(topic)
                    results["steps"].append({"agent": "quiz", "output": quiz})

            # 🧩 Always finish with Responsible AI validation
            rai = self.responsible.check(payload, results["steps"])
            results["steps"].append({"agent": "responsible_ai", "output": rai})
            return results

        # 🚫 Unknown task
        return {"error_type": "UnknownTask", "detail": f"Unknown task: {task}"}
