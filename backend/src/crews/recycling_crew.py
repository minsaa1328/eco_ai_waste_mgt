from crewai import Agent, Task, Crew, Process
import os
from dotenv import load_dotenv
from ..utils.serper_api import search_serper

# Load environment variables
load_dotenv()


class RecyclingCrew:
    def __init__(self):
        # Define the Recycling Guide Agent - CrewAI handles OpenAI integration internally
        self.guide_agent = Agent(
            role='Recycling Guidelines Expert',
            goal='Provide detailed, actionable recycling instructions for specific waste categories',
            backstory="""You are a knowledgeable sustainability expert with expertise in waste management 
            protocols across different regions. You provide clear, practical advice for proper waste disposal 
            and recycling practices. You're passionate about helping people reduce environmental impact 
            through proper waste management.""",
            verbose=True
        )

        # Define the Task for the Agent
        self.guide_task = Task(
            description="""Create a comprehensive recycling guide for {waste_category}. 
            Include: 
            1. Preparation steps (cleaning, sorting, etc.)
            2. Proper disposal methods 
            3. Common mistakes to avoid 
            4. Environmental benefits of proper recycling
            5. Any location-specific considerations if provided

            Keep it practical, actionable, and easy to understand.""",
            agent=self.guide_agent,
            expected_output="A detailed, multi-paragraph recycling guide with practical advice and recommendations."
        )

        # Assemble the Crew
        self.crew = Crew(
            agents=[self.guide_agent],
            tasks=[self.guide_task],
            process=Process.sequential,
            verbose=True
        )

    def get_guide(self, waste_category: str, user_location: str = None):
        query = f"How to recycle {waste_category}"
        if user_location:
            query += f" in {user_location}"

        payload = {"q": query, "gl": "LK", "hl": "en"}

        # Call Serper API with proper payload
        snippet  = search_serper(payload)

        # If IR fails, fallback to CrewAI only
        if "No results found" in snippet or "Error" in snippet:
            inputs = {"waste_category": waste_category}
            if user_location:
                inputs["user_location"] = user_location
            result = self.crew.kickoff(inputs=inputs)
            return result.raw if hasattr(result, 'raw') else str(result)

        # Otherwise, enrich CrewAI with IR snippet (RAG)
        enriched_prompt = f"""
        Using this real-world snippet from a recycling source:
        ---
        {snippet}
        ---
        Write a structured recycling guide for {waste_category}.
        Include:
        1. Preparation steps
        2. Proper disposal methods
        3. Common mistakes to avoid
        4. Environmental benefits
        5. Location-specific considerations ({user_location if user_location else 'if available'})
        Make it clear, practical, and easy to follow.
        """

        result = self.crew.kickoff(
            inputs={"waste_category": waste_category, "snippet": snippet, "prompt": enriched_prompt})
        guide = result.raw if hasattr(result, 'raw') else str(result)

        return guide
