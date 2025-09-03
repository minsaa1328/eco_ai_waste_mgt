from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv

load_dotenv()

class AwarenessCrew:
    def __init__(self):
        self.awareness_agent = Agent(
            role='Environmental Awareness Educator',
            goal='Educate users with practical waste management tips, awareness facts, and quizzes',
            backstory="""You are an enthusiastic environmental educator who makes waste management
            engaging and easy to understand. You share fun facts, tips, and short quizzes to help
            people learn about recycling, reducing waste, and protecting the environment.""",
            verbose=True
        )

        self.awareness_task = Task(
            description="""Create an awareness package with the following sections:

            Fact: a fun fact or statistic about recycling/waste
            Tip: a simple eco-friendly tip
            Quiz Question: a short quiz question
            Quiz Options: 3 short multiple-choice options (A, B, C)
            Quiz Answer: the correct option

            Format it as plain text exactly like this:

            Fact: ...
            Tip: ...
            Quiz Question: ...
            Quiz Options: A) ... | B) ... | C) ...
            Quiz Answer: ...
            """,
            agent=self.awareness_agent,
            expected_output="Fact, Tip, Quiz Question, Quiz Options, Quiz Answer in plain text"
        )

        self.crew = Crew(
            agents=[self.awareness_agent],
            tasks=[self.awareness_task],
            process=Process.sequential,
            verbose=True
        )

    def get_awareness_message(self):
        result = self.crew.kickoff(inputs={})
        return result.raw if hasattr(result, 'raw') else str(result)


# Example usage
if __name__ == "__main__":
    crew = AwarenessCrew()
    msg = crew.get_awareness_message()
    print("\n--- Awareness Message ---\n")
    print(msg)
