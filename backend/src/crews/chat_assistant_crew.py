"""
Chat Assistant Crew for Recycling Guide Clarification
Provides conversational assistance for recycling questions and guide explanations.
"""
from crewai import Agent, Task, Crew, Process, LLM
from dotenv import load_dotenv
from typing import Optional
import json

load_dotenv()


class ChatAssistantCrew:
    """
    Chat Assistant Agent for answering recycling-related questions.
    Maintains context awareness of recycling guides and previous conversations.
    """

    def __init__(self):
        # Define the Chat Assistant Agent
        self.chat_agent = Agent(
            role='Recycling Guide Chat Assistant',
            goal='Help users understand recycling guides, answer follow-up questions clearly, and provide actionable recycling advice based on classified waste items.',
            backstory="""You are a friendly and knowledgeable recycling expert assistant. 
            You specialize in explaining recycling guides, clarifying disposal methods, 
            answering safety questions, and helping users recycle correctly. 
            You always provide factual, clear, and user-friendly responses based on the 
            recycling guide context provided. You maintain conversation history and can 
            reference previous topics discussed with the user.""",
            verbose=True
        )

    def chat(self, user_message: str, recycling_guide: Optional[str] = None,
             conversation_history: Optional[str] = None, waste_category: Optional[str] = None) -> str:
        """
        Process a chat message from the user with context awareness.

        Args:
            user_message: The user's question or input
            recycling_guide: Current recycling guide context (from RecyclingCrew)
            conversation_history: Previous conversation summary
            waste_category: The classified waste type (e.g., "plastic bottle")

        Returns:
            Chat assistant's response as a string
        """
        try:
            # Build context-aware prompt
            context_parts = []

            if recycling_guide:
                context_parts.append(f"**Current Recycling Guide:**\n{recycling_guide}\n")

            if waste_category:
                context_parts.append(f"**Waste Item:** {waste_category}\n")

            if conversation_history:
                context_parts.append(f"**Previous Conversation:**\n{conversation_history}\n")

            context_parts.append(f"**User Question:** {user_message}")

            full_context = "\n".join(context_parts)

            # Create the chat task
            chat_task = Task(
                description=f"""You are assisting a user with recycling questions. 
                
{full_context}

Provide a helpful, clear, and accurate response based on the recycling guide and context above.
If the user is asking about how to recycle, safety concerns, or disposal methods, use the guide information.
If the question is unclear, ask for clarification politely.
Keep responses concise (2-4 sentences) unless detailed explanation is needed.
Always be encouraging and supportive of the user's recycling efforts.""",
                agent=self.chat_agent,
                expected_output="A clear, helpful response to the user's question about recycling."
            )

            # Create temporary crew for this chat interaction
            chat_crew = Crew(
                agents=[self.chat_agent],
                tasks=[chat_task],
                process=Process.sequential,
                verbose=True
            )

            # Execute and get response
            result = chat_crew.kickoff()
            response = result.raw if hasattr(result, 'raw') else str(result)

            return response.strip()

        except Exception as e:
            print(f"❌ Chat Assistant error: {e}")
            return self._get_fallback_response(user_message, waste_category)

    def _get_fallback_response(self, user_message: str, waste_category: Optional[str] = None) -> str:
        """
        Provide a fallback response when the AI service fails.

        Args:
            user_message: The user's question
            waste_category: The waste type being discussed

        Returns:
            A helpful fallback message
        """
        fallback_responses = {
            "how": f"To recycle {waste_category or 'this item'}, please check your local recycling guidelines. Generally, ensure the item is clean and dry before placing it in the appropriate recycling bin.",
            "where": f"You can recycle {waste_category or 'this item'} at most local recycling centers. Check your municipal website or use a recycling locator app to find the nearest facility.",
            "safe": f"For safe recycling of {waste_category or 'this item'}, always handle with care, especially if it's sharp or contains residue. Rinse containers and remove any non-recyclable parts.",
            "can": f"Yes, {waste_category or 'most items'} can typically be recycled if properly cleaned and sorted. Check the recycling symbol and number on the item for specific guidelines.",
        }

        # Simple keyword matching for fallback
        user_lower = user_message.lower()
        for keyword, response in fallback_responses.items():
            if keyword in user_lower:
                return response

        # Generic fallback
        return f"I'm here to help you recycle {waste_category or 'your waste items'} correctly! Could you please rephrase your question? For example, you can ask 'How do I recycle this?' or 'Where can I dispose of this?'"

