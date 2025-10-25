from crewai import Agent, Task, Crew, Process, LLM
from dotenv import load_dotenv
import json
import os

load_dotenv()


class AwarenessCrew:
    def __init__(self):
        # Define the Quiz Agent
        self.awareness_agent = Agent(
            role='Environmental Quiz Educator',
            goal='Create engaging, motivational, and educational content about waste management to inspire behavior change',
            backstory="""You are a passionate environmental educator and communication expert.""",
            # llm=LLM(model="gpt-3.5-turbo"),
            verbose=True
        )

        # Define the Quiz Master Agent
        self.quiz_agent = Agent(
            role='Gamification and Quiz Specialist',
            goal='Create fun, informative quizzes to test and reinforce knowledge about waste management',
            backstory="""You are an expert in gamified learning and educational psychology.""",
            # llm=LLM(model="gpt-3.5-turbo"),
            verbose=True
        )

        # Task 1: Generate an Quiz Fact/Tip
        self.awareness_task = Task(
            description="""Generate a short, engaging, and motivational awareness message about waste management.
            The message should be based on this context: {input}""",
            agent=self.awareness_agent,
            expected_output="A concise, engaging motivational message with a fact."
        )

        # Task 2: Generate a Mini-Quiz
        self.quiz_task = Task(
            description="""Create a single, multiple-choice quiz question to test knowledge about {input}.""",
            agent=self.quiz_agent,
            expected_output="JSON object with quiz question, options, correct answer, and explanation."
        )

        # Create separate crews for each task
        self.awareness_crew = Crew(
            agents=[self.awareness_agent],
            tasks=[self.awareness_task],
            process=Process.sequential,
            verbose=True
        )

        self.quiz_crew = Crew(
            agents=[self.quiz_agent],
            tasks=[self.quiz_task],
            process=Process.sequential,
            verbose=True
        )

    def get_awareness_tip(self, context: str):
        """Get a quick awareness tip/fact based on a user's action or a general topic."""
        try:
            # Use crew.kickoff() with inputs
            result = self.awareness_crew.kickoff(inputs={"input": context})
            return result.raw if hasattr(result, 'raw') else str(result)
        except Exception as e:
            print(f"❌ Quiz tip error: {e}")
            fallback_tips = [
                "Great job! Recycling helps reduce landfill waste and conserve natural resources. ♻️",
                "Awesome! Every recycled item makes a difference for our planet. 🌍",
                "Thank you for recycling! You're helping create a sustainable future. 🌱",
                "Perfect! Recycling saves energy and reduces greenhouse gas emissions. ⚡"
            ]
            import random
            return random.choice(fallback_tips)

    def get_quiz_question(self, topic: str):
        """Get a quiz question JSON object on a specific waste management topic."""
        try:
            # Use crew.kickoff() with inputs
            result = self.quiz_crew.kickoff(inputs={"input": topic})
            output = result.raw if hasattr(result, 'raw') else str(result)

            # Clean up the output - remove code formatting if present
            cleaned_output = output
            if '```json' in cleaned_output:
                cleaned_output = cleaned_output.split('```json')[1].split('```')[0].strip()
            elif '```' in cleaned_output:
                cleaned_output = cleaned_output.split('```')[1].split('```')[0].strip()

            # Parse JSON
            quiz_data = json.loads(cleaned_output)

            # Normalize the format to ensure consistent structure
            normalized_data = {
                'question': quiz_data.get('question', 'What is the question?'),
                'options': self._normalize_options(quiz_data.get('options', {})),
                'correct_answer': self._normalize_answer(quiz_data.get('correct_answer', 'A')),
                'explanation': quiz_data.get('explanation', 'This is the explanation.')
            }

            return normalized_data

        except Exception as e:
            print(f"❌ Quiz generation error: {e}")
            print(f"❌ Raw output that failed: {output}")
            print("🆘 Using fallback questions...")
            return self._get_enhanced_fallback_quiz(topic)

    def _normalize_options(self, options):
        """Normalize options to consistent dictionary format."""
        if isinstance(options, list):
            # Convert list to dict: ['A) Option1', 'B) Option2'] -> {'A': 'Option1', 'B': 'Option2'}
            normalized = {}
            for i, option in enumerate(options):
                if isinstance(option, str) and ')' in option:
                    # Handle "A) Option text" format
                    parts = option.split(')', 1)
                    key = parts[0].strip()
                    value = parts[1].strip() if len(parts) > 1 else f"Option {i + 1}"
                    normalized[key] = value
                else:
                    # Handle simple list items
                    key = chr(65 + i)  # A, B, C, D
                    normalized[key] = str(option)
            return normalized
        elif isinstance(options, dict):
            return options
        else:
            return {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"}

    def _normalize_answer(self, answer):
        """Normalize answer format to single letter."""
        if isinstance(answer, str):
            # Extract just the letter from answers like "B) Correct answer" or "B"
            if ')' in answer:
                return answer.split(')')[0].strip()
            # Ensure it's a single letter
            return answer[0] if answer else 'A'
        return 'A'

    def _get_enhanced_fallback_quiz(self, topic: str):
        """Enhanced fallback with multiple questions per topic."""
        fallback_quizzes = {
            "general": [
                {
                    "question": "What percentage of plastic waste is actually recycled worldwide?",
                    "options": {"A": "9%", "B": "25%", "C": "50%", "D": "75%"},
                    "correct_answer": "A",
                    "explanation": "Only about 9% of all plastic waste ever produced has been recycled."
                },
                {
                    "question": "Which country generates the most plastic waste per person?",
                    "options": {"A": "United States", "B": "China", "C": "India", "D": "Germany"},
                    "correct_answer": "A",
                    "explanation": "The US generates the most plastic waste per capita."
                }
            ],
            "composting": [
                {
                    "question": "Which of these items should NOT be composted?",
                    "options": {"A": "Vegetable scraps", "B": "Egg shells", "C": "Meat and dairy",
                                "D": "Coffee grounds"},
                    "correct_answer": "C",
                    "explanation": "Meat and dairy products should not be composted in home compost bins."
                },
                {
                    "question": "What is the ideal carbon-to-nitrogen ratio for compost?",
                    "options": {"A": "10:1", "B": "25:1", "C": "50:1", "D": "100:1"},
                    "correct_answer": "B",
                    "explanation": "The ideal C:N ratio for composting is 25-30:1 for optimal decomposition."
                }
            ],
            "plastic": [
                {
                    "question": "How long does it take for a plastic bottle to decompose?",
                    "options": {"A": "50 years", "B": "100 years", "C": "450 years", "D": "1000 years"},
                    "correct_answer": "C",
                    "explanation": "Plastic bottles can take up to 450 years to decompose."
                },
                {
                    "question": "Which plastic recycling number is most widely accepted?",
                    "options": {"A": "#1 - PET", "B": "#2 - HDPE", "C": "#5 - PP", "D": "#6 - PS"},
                    "correct_answer": "A",
                    "explanation": "#1 PET plastic is the most commonly accepted type in recycling programs."
                }
            ],
            "recycling": [
                {
                    "question": "What does 'wishcycling' mean?",
                    "options": {
                        "A": "Putting non-recyclable items in recycling bins hoping they'll be recycled",
                        "B": "Wishing for better recycling facilities",
                        "C": "Recycling birthday wishes",
                        "D": "A new recycling technology"
                    },
                    "correct_answer": "A",
                    "explanation": "Wishcycling contaminates recycling streams and makes processing less efficient."
                },
                {
                    "question": "Why should you rinse containers before recycling?",
                    "options": {
                        "A": "To prevent contamination of other materials",
                        "B": "To make them look nicer",
                        "C": "It's not necessary",
                        "D": "To increase their weight"
                    },
                    "correct_answer": "A",
                    "explanation": "Food residue can contaminate entire batches of recyclable materials."
                }
            ]
        }

        # Get quizzes for the topic or default to general
        topic_quizzes = fallback_quizzes.get(topic.lower(), fallback_quizzes["general"])
        import random
        quiz_data = random.choice(topic_quizzes)
        return json.dumps(quiz_data)

