# backend/src/crews/classifier_crew.py
import os
import requests
import json
from io import BytesIO
from PIL import Image
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class ClassifierCrew:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        self.categories = ["recyclable", "organic", "hazardous", "general"]

    def _encode_image(self, image_path: str) -> str:
        """Helper function to encode a local image to base64 for the Gemini API."""
        try:
            with Image.open(image_path) as img:
                if img.mode in ('RGBA', 'LA'):
                    img = img.convert('RGB')
                buffered = BytesIO()
                img.save(buffered, format="JPEG")
                return base64.b64encode(buffered.getvalue()).decode('utf-8')
        except Exception as e:
            raise Exception(f"Failed to process image: {str(e)}")

    def _call_gemini_api(self, prompt: str, image_data: str = None) -> str:
        """Call Gemini 2.0 Flash API with proper headers and format."""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not set")

        headers = {
            'Content-Type': 'application/json',
            'X-goog-api-key': self.api_key
        }

        content = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        }

        # Add image data if provided
        if image_data:
            content["contents"][0]["parts"].append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": image_data
                }
            })

        try:
            response = requests.post(self.api_url, headers=headers, json=content)
            response.raise_for_status()

            result = response.json()
            if 'candidates' in result and result['candidates']:
                return result['candidates'][0]['content']['parts'][0]['text'].strip()
            else:
                raise Exception("No valid response from Gemini API")

        except Exception as e:
            print(f"Gemini API error: {e}")
            raise

    def _classify_with_gemini(self, input_data: str, is_image: bool = False) -> str:
        """Classify using Gemini 2.0 Flash API"""
        prompt = """You are a waste classification expert. Classify this item into exactly one category: 
        recyclable, organic, hazardous, or general.

        Respond with ONLY the single category name: 'recyclable', 'organic', 'hazardous', or 'general'.
        Do not include any other text, explanations, or punctuation."""

        try:
            if is_image:
                base64_image = self._encode_image(input_data)
                response_text = self._call_gemini_api(prompt, base64_image)
            else:
                item_prompt = f"{prompt}\n\nItem: {input_data}"
                response_text = self._call_gemini_api(item_prompt)

            classification = response_text.strip().lower().replace('.', '')
            return classification if classification in self.categories else "general"

        except Exception as e:
            print(f"Gemini classification error: {e}")
            return self._basic_classification(input_data)

    def _basic_classification(self, text: str) -> str:
        """Basic fallback classification using keyword matching"""
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

    def classify(self, input_data: str, is_image: bool = False) -> str:
        """
        Classify the waste item using Gemini 2.0 Flash API with fallback.
        """
        try:
            if self.api_key:
                return self._classify_with_gemini(input_data, is_image)
            else:
                # No API key, use basic classification
                if is_image:
                    return "general"
                else:
                    return self._basic_classification(input_data)

        except Exception as e:
            print(f"Classification error: {e}")
            if not is_image:
                return self._basic_classification(input_data)
            return "general"