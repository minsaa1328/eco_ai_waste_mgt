from src.crews.awareness_crew import AwarenessCrew
from src.crews.classifier_crew import ClassifierCrew
from src.crews.recycling_crew import RecyclingCrew


class OrchestratorCrew:
    """
    Central orchestrator for all multi-agent communication.
    All single-agent tasks + multi-agent workflows run through here.
    """

    def __init__(self):
        self.awareness = AwarenessCrew()
        self.classifier = ClassifierCrew()
        self.recycling = RecyclingCrew()

    def handle_task(self, task: str, payload: dict, needs: list[str] = None):
        """
        Decide which agent(s) to call based on task or explicit 'needs'.
        Supports:
          - classify_text
          - classify_image
          - recycle
          - awareness
          - quiz
          - end_to_end (chained workflow)
        """

        task = task.lower().strip()

        # --- Needs override (manual selection of agents) ---
        if needs:
            results = {"task": task, "steps": []}

            # Always run classifier first
            item = payload.get("item") or payload.get("image_path")
            if not item:
                return {"error_type": "ValidationError",
                        "detail": "Missing 'item' or 'image_path' for classification"}
            category = self.classifier.classify(item, is_image=bool(payload.get("image_path")))
            results["steps"].append({"agent": "classifier", "output": category})

            # Run other agents based on needs
            if "guide" in needs or "recycle" in needs:
                guide = self.recycling.get_guide(category, user_location=payload.get("location"))
                results["steps"].append({"agent": "recycling", "output": guide})

            if "awareness" in needs:
                tip = self.awareness.get_awareness_tip(f"Item classified as {category}")
                results["steps"].append({"agent": "awareness", "output": tip})

            if "quiz" in needs:
                quiz = self.awareness.get_quiz_question(category)
                results["steps"].append({"agent": "quiz", "output": quiz})

            return results

        # --- Classification ---
        if task == "classify_text":
            item = payload.get("item")
            if not item:
                return {"error_type": "ValidationError", "detail": "Missing 'item' for text classification"}
            category = self.classifier.classify(item, is_image=False)
            return {"task": "classify_text", "steps": [{"agent": "classifier", "output": category}]}

        elif task == "classify_image":
            image_path = payload.get("image_path")
            if not image_path:
                return {"error_type": "ValidationError", "detail": "Missing 'image_path' for image classification"}
            category = self.classifier.classify(image_path, is_image=True)
            return {"task": "classify_image", "steps": [{"agent": "classifier", "output": category}]}

        # --- Recycling Guide ---
        elif task == "recycle":
            waste_category = payload.get("waste_category")
            location = payload.get("location")
            if not waste_category:
                return {"error_type": "ValidationError", "detail": "Missing 'waste_category' for recycling guide"}
            guide = self.recycling.get_guide(waste_category, user_location=location)
            return {"task": "recycle", "steps": [{"agent": "recycling", "output": guide}]}

        # --- Awareness ---
        elif task == "awareness":
            context = payload.get("context")
            if not context:
                return {"error_type": "ValidationError", "detail": "Missing 'context' for awareness tip"}
            tip = self.awareness.get_awareness_tip(context)
            return {"task": "awareness", "steps": [{"agent": "awareness", "output": tip}]}

        # --- Quiz ---
        elif task == "quiz":
            topic = payload.get("topic")
            if not topic:
                return {"error_type": "ValidationError", "detail": "Missing 'topic' for quiz"}
            quiz = self.awareness.get_quiz_question(topic)
            return {"task": "quiz", "steps": [{"agent": "quiz", "output": quiz}]}

        # --- End-to-End Workflow ---
        elif task == "end_to_end":
            is_image = payload.get("is_image", False)

            if is_image:
                image_path = payload.get("image_path")
                if not image_path:
                    return {"error_type": "ValidationError", "detail": "Missing 'image_path' for end-to-end image flow"}
                classification = self.classifier.classify(image_path, is_image=True)
                context_item = "uploaded image"
            else:
                item = payload.get("item")
                if not item:
                    return {"error_type": "ValidationError", "detail": "Missing 'item' for end-to-end text flow"}
                classification = self.classifier.classify(item, is_image=False)
                context_item = item

            guide = self.recycling.get_guide(classification, user_location=payload.get("location"))
            tip = self.awareness.get_awareness_tip(f"{context_item} classified as {classification}")
            quiz = self.awareness.get_quiz_question(classification)

            return {
                "task": "end_to_end",
                "steps": [
                    {"agent": "classifier", "output": classification},
                    {"agent": "recycling", "output": guide},
                    {"agent": "awareness", "output": tip},
                    {"agent": "quiz", "output": quiz}
                ]
            }

        # --- Unknown Task ---
        else:
            return {"error_type": "UnknownTask", "detail": f"Unknown task: {task}"}
