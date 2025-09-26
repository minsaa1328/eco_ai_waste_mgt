# backend/src/crews/classifier_crew.py
import os
import requests
import base64
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Load environment variables
load_dotenv()


class ClassifierCrew:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        self.categories = ["recyclable", "organic", "hazardous", "general"]

        # Define the CrewAI agent
        self.classifier_agent = Agent(
            role="Waste Classification Expert",
            goal="Classify waste items into recyclable, organic, hazardous, or general",
            backstory="""You are an expert in waste management. You always respond with exactly one of:
            recyclable, organic, hazardous, or general.""",
            verbose=True
        )

        # Define the CrewAI task
        self.classify_task = Task(
            description="""Classify the following waste item into one of these categories:
            recyclable, organic, hazardous, or general.

            Item: {input}""",
            agent=self.classifier_agent,
            expected_output="One of: recyclable, organic, hazardous, general"
        )

        # Assemble Crew
        self.crew = Crew(
            agents=[self.classifier_agent],
            tasks=[self.classify_task],
            process=Process.sequential,
            verbose=True
        )

    # ---------------- Gemini API Support ----------------
    def _encode_image(self, image_path: str) -> str:
        """Helper: encode image to base64 for Gemini API."""
        with Image.open(image_path) as img:
            if img.mode in ('RGBA', 'LA'):
                img = img.convert('RGB')
            buffered = BytesIO()
            img.save(buffered, format="JPEG")
            return base64.b64encode(buffered.getvalue()).decode('utf-8')

    def _call_gemini_api(self, prompt: str, image_data: str = None) -> str:
        """Call Gemini 2.0 Flash API."""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not set")

        headers = {
            'Content-Type': 'application/json',
            'X-goog-api-key': self.api_key
        }

        content = {"contents": [{"parts": [{"text": prompt}]}]}
        if image_data:
            content["contents"][0]["parts"].append({
                "inline_data": {"mime_type": "image/jpeg", "data": image_data}
            })

        response = requests.post(self.api_url, headers=headers, json=content)
        response.raise_for_status()
        result = response.json()

        if 'candidates' in result and result['candidates']:
            return result['candidates'][0]['content']['parts'][0]['text'].strip()
        else:
            raise Exception("No valid response from Gemini API")

    # ---------------- Fallback Classification ----------------
    def _basic_classification(self, text: str) -> str:
        """Simple keyword fallback classification."""
        text_lower = text.lower()

        recyclable_keywords = ['plastic', 'glass', 'paper', 'metal', 'can', 'bottle', 'aluminum', 'cardboard', 'tin',
                               'jar']
        organic_keywords = ['food', 'fruit', 'vegetable', 'organic', 'compost', 'banana', 'apple', 'peel', 'egg',
                            'coffee', 'tea']
        hazardous_keywords = ['battery', 'chemical', 'electronic', 'hazardous', 'toxic', 'medicine', 'paint', 'oil',
                              'bulb', 'phone']

        if any(word in text_lower for word in recyclable_keywords):
            return "recyclable"
        elif any(word in text_lower for word in organic_keywords):
            return "organic"
        elif any(word in text_lower for word in hazardous_keywords):
            return "hazardous"
        else:
            return "general"

    # ---------------- Public Method ----------------
    def classify(self, input_data: str, is_image: bool = False) -> str:
        """
        Classify waste item using CrewAI + Gemini (with fallback).
        Must return one of: recyclable, organic, hazardous, general
        """
        try:
            # Prefer Gemini API if available
            if self.api_key:
                prompt = """You are a waste classification expert.
                Classify the item into exactly one category:
                recyclable, organic, hazardous, or general.
                Respond with ONLY the single category name."""

                if is_image:
                    base64_image = self._encode_image(input_data)
                    response_text = self._call_gemini_api(prompt, base64_image)
                else:
                    response_text = self._call_gemini_api(f"{prompt}\n\nItem: {input_data}")

                classification = response_text.strip().lower().replace('.', '')
                return classification if classification in self.categories else "general"

            # If no Gemini, fall back to CrewAI Agent
            result = self.crew.kickoff(inputs={"input": input_data})
            output = result.raw if hasattr(result, 'raw') else str(result)
            output = output.strip().lower()
            return output if output in self.categories else "general"

        except Exception as e:
            print(f"Classification error: {e}")
            if not is_image:
                return self._basic_classification(input_data)
            return "general"
