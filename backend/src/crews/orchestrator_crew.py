from ..crews.awareness_crew import AwarenessCrew
from ..crews.classifier_crew import ClassifierCrew
from ..crews.recycling_crew import RecyclingCrew
from ..crews.responsibleAICrew import ResponsibleAICrew


class OrchestratorCrew:
    """
    Central orchestrator coordinating all AI agents:
    Classifier, Recycling, Quiz, Quiz, Responsible AI.
    """

    def __init__(self):
        self.awareness = AwarenessCrew()
        self.classifier = ClassifierCrew()
        self.recycling = RecyclingCrew()
        self.responsible = ResponsibleAICrew()

    def handle_task(self, task: str, payload: dict, needs: list[str] = None):
        """
        Unified orchestrator for all agent tasks.
        Handles direct and multi-agent "custom" workflows.
        """
        task = task.lower().strip()

        # --- Single Agent Handlers ---
        if task in ["classify", "classify_text", "classify_image"]:
            item = payload.get("item") or payload.get("image_path")
            category = self.classifier.classify(item, is_image=bool(payload.get("image_path")))
            return {"steps": [{"agent": "classifier", "output": category}]}

        if task == "recycle":
            category = payload.get("category") or payload.get("waste_category") or "general"
            guide = self.recycling.get_guide(category, user_location=payload.get("location"))
            return {"steps": [{"agent": "recycling", "output": guide}]}

        if task == "awareness":
            context = payload.get("context") or "environmental sustainability"
            tip = self.awareness.get_awareness_tip(context)
            return {"steps": [{"agent": "awareness", "output": tip}]}

        if task == "quiz":
            topic = payload.get("topic") or "recycling"
            quiz = self.awareness.get_quiz_question(topic)
            return {"steps": [{"agent": "quiz", "output": quiz}]}

        # --- Multi-Agent Custom Flow ---
        if task == "custom":
            if not needs:
                return {"error_type": "ValidationError", "detail": "Missing 'needs' list for custom task."}

            results = {"task": "custom", "steps": []}
            category = None
            context = payload.get("context")

            for need in needs:
                need = need.lower().strip()

                # Classification
                if need in ["classify", "classifier"]:
                    item = payload.get("item") or payload.get("image_path")
                    if not item:
                        return {"error_type": "ValidationError", "detail": "Missing 'item' for classification."}
                    category = self.classifier.classify(item, is_image=bool(payload.get("image_path")))
                    results["steps"].append({"agent": "classifier", "output": category})
                    payload["category"] = category

                #Recycling
                elif need in ["recycle", "recycling", "guide"]:
                    category = category or payload.get("category", "general")
                    guide = self.recycling.get_guide(category, user_location=payload.get("location"))
                    results["steps"].append({"agent": "recycling", "output": guide})
                    payload["guide"] = guide

                # quiz
                elif need in ["awareness", "educate", "tip"]:
                    context = context or f"Information about {category or 'waste management'}"
                    tip = self.awareness.get_awareness_tip(context)
                    results["steps"].append({"agent": "awareness", "output": tip})

                # Quiz
                elif need in ["quiz"]:
                    topic = category or payload.get("topic") or "recycling"
                    quiz = self.awareness.get_quiz_question(topic)
                    results["steps"].append({"agent": "quiz", "output": quiz})

            #  Responsible AI check always last
            rai = self.responsible.check(payload, results["steps"])
            results["steps"].append({"agent": "responsible_ai", "output": rai})
            return results

        # --- Default Fallback ---
        # Any unknown task auto-routes to classifier
        item = payload.get("item") or payload.get("text") or payload.get("image_path")
        if item:
            category = self.classifier.classify(item, is_image=bool(payload.get("image_path")))
            return {"steps": [{"agent": "classifier", "output": category}]}

        return {"error_type": "UnknownTask", "detail": f"Unknown task: {task}"}
