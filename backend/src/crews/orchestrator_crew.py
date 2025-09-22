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

    def handle_task(self, task: str, payload: dict):
        """
        Decide which agent(s) to call based on task.
        Supported tasks:
          - classify_text
          - classify_image
          - recycle
          - awareness
          - quiz
          - end_to_end (text or image workflow)
        """
        task = task.lower().strip()

        # --- Classification ---
        if task == "classify_text":
            item = payload.get("item")
            if not item:
                return {"error_type": "ValidationError", "detail": "Missing 'item' for text classification"}
            category = self.classifier.classify(item, is_image=False)
            return {"classification": category}

        elif task == "classify_image":
            image_path = payload.get("image_path")
            if not image_path:
                return {"error_type": "ValidationError", "detail": "Missing 'image_path' for image classification"}
            category = self.classifier.classify(image_path, is_image=True)
            return {"classification": category}

        # --- Recycling Guide ---
        elif task == "recycle":
            waste_category = payload.get("waste_category")
            location = payload.get("location")
            if not waste_category:
                return {"error_type": "ValidationError", "detail": "Missing 'waste_category' for recycling guide"}
            guide = self.recycling.get_guide(waste_category, user_location=location)
            return {"recycling_guide": guide}

        # --- Awareness ---
        elif task == "awareness":
            context = payload.get("context")
            if not context:
                return {"error_type": "ValidationError", "detail": "Missing 'context' for awareness tip"}
            tip = self.awareness.get_awareness_tip(context)
            return {"awareness_tip": tip}

        # --- Quiz ---
        elif task == "quiz":
            topic = payload.get("topic")
            if not topic:
                return {"error_type": "ValidationError", "detail": "Missing 'topic' for quiz"}
            quiz = self.awareness.get_quiz_question(topic)
            return {"quiz": quiz}

        # --- End-to-End Workflow ---
        elif task == "end_to_end":
            is_image = payload.get("is_image", False)

            if is_image:
                image_path = payload.get("image_path")
                if not image_path:
                    return {
                        "error_type": "ValidationError",
                        "detail": "Missing 'image_path' for end-to-end image flow",
                    }
                classification = self.classifier.classify(image_path, is_image=True)
                context_item = "uploaded image"
            else:
                item = payload.get("item")
                if not item:
                    return {
                        "error_type": "ValidationError",
                        "detail": "Missing 'item' for end-to-end text flow",
                    }
                classification = self.classifier.classify(item, is_image=False)
                context_item = item

            # Step 2: Recycling Guide
            guide = self.recycling.get_guide(
                classification, user_location=payload.get("location")
            )

            # Step 3: Awareness Tip
            tip = self.awareness.get_awareness_tip(f"{context_item} classified as {classification}")

            # Step 4: (Optional) Quiz for that category
            quiz = self.awareness.get_quiz_question(classification)

            return {
                "classification": classification,
                "recycling_guide": guide,
                "awareness_tip": tip,
                "quiz": quiz,
            }

        # --- Unknown Task ---
        else:
            return {"error_type": "UnknownTask", "detail": f"Unknown task: {task}"}
