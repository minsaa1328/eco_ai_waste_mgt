import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { CheckCircleIcon, XCircleIcon, RefreshCwIcon } from "lucide-react";

export const Quiz = () => {
  const location = useLocation();
  const { item, category } = location.state || {};
  const { getToken } = useAuth();

  const [quizData, setQuizData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL + "/api/orchestrator";

  // ---------------- FETCH QUIZ ----------------
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const topic = category || item || "recycling";

        const payload = {
          task: "custom",
          need: ["quiz"],
          payload: { topic },
        };

        const res = await axios.post(`${API_URL}/handle`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const steps = res.data?.steps || [];
        const quizStep = steps.find(
          (s) => s.agent && s.agent.toLowerCase() === "quiz"
        );

        if (!quizStep || !quizStep.output) {
          setError("No quiz data received from backend.");
          return;
        }

        let quizOutput = quizStep.output;

        // ✅ Clean up formatting and parse JSON if necessary
        if (typeof quizOutput === "string") {
          quizOutput = quizOutput
            .replace(/```json/i, "")
            .replace(/```/g, "")
            .trim();

          try {
            quizOutput = JSON.parse(quizOutput);
          } catch {
            console.warn("⚠️ Non-JSON quiz output detected, attempting fallback parse...");
            const qMatch = quizOutput.match(/"question"\s*:\s*"([^"]+)"/);
            const oMatch = quizOutput.match(/"options"\s*:\s*\[(.*?)\]/s);
            const aMatch = quizOutput.match(/"correct_answer"\s*:\s*"([^"]+)"/);
            const eMatch = quizOutput.match(/"explanation"\s*:\s*"([^"]+)"/);

            quizOutput = {
              question: qMatch?.[1] || "Question could not be parsed.",
              options: oMatch
                ? oMatch[1]
                    .split(/",\s*"/)
                    .map((opt) => opt.replace(/["\[\]]/g, "").trim())
                : [],
              correct_answer: aMatch?.[1] || "",
              explanation: eMatch?.[1] || "",
            };
          }
        }

        // ✅ Normalize options for consistent display
        if (Array.isArray(quizOutput.options)) {
          quizOutput.options = quizOutput.options.map((opt) => {
            if (typeof opt === "object" && opt !== null) {
              const key = Object.keys(opt)[0];
              return `${key}) ${opt[key]}`;
            }
            return String(opt).trim();
          });
        } else if (typeof quizOutput.options === "object" && quizOutput.options !== null) {
          quizOutput.options = Object.entries(quizOutput.options).map(
            ([key, value]) => `${key}) ${value}`
          );
        } else if (typeof quizOutput.options === "string") {
          quizOutput.options = quizOutput.options
            .split(/\r?\n|,|;/)
            .map((opt) => opt.trim())
            .filter((opt) => opt.length > 0);
        } else {
          quizOutput.options = [];
        }

        setQuizData(quizOutput);
      } catch (err) {
        console.error("❌ Failed to load quiz:", err.response?.data || err);
        setError("Failed to connect to backend quiz agent or unauthorized.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [item, category, getToken]);

  // ---------------- SUBMIT ANSWER ----------------
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !quizData) return;

    try {
      setIsSubmitted(true);
      const token = await getToken();
      const response = await axios.post(
        `${API_URL}/quiz/answer`,
        {
          quiz_data: quizData,
          selected_answer: selectedAnswer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const step = response.data?.steps?.[0];
      if (step?.output) setResult(step.output);
    } catch (err) {
      console.error("❌ Quiz answer validation failed:", err.response?.data || err);
    }
  };

  // ---------------- RETRY ----------------
  const handleRetry = () => {
    setQuizData(null);
    setSelectedAnswer("");
    setIsSubmitted(false);
    setResult(null);
    setLoading(true);
    setError("");
    setTimeout(() => window.location.reload(), 300);
  };

  // ---------------- UI STATES ----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600 animate-pulse">Loading quiz...</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-3">
        <p className="text-gray-700 font-medium">
          {error || "No quiz available at the moment."}
        </p>
        <button
          onClick={handleRetry}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { question, options, correct_answer, explanation } = quizData;
  const isCorrect = result?.is_correct;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Eco Awareness Quiz</h1>

      <Card>
        <div className="space-y-4">
          <Badge color="green" className="text-sm">
            {category || "General"}
          </Badge>

          <h2 className="text-xl font-semibold text-gray-800">{question}</h2>

          <div className="space-y-3">
            {options.map((opt, index) => (
              <label
                key={index}
                className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedAnswer === opt
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="quiz"
                  value={opt}
                  checked={selectedAnswer === opt}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="text-green-600 focus:ring-green-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
            >
              Submit Answer
            </button>
          ) : (
            <div className="mt-6 text-center space-y-3">
              {isCorrect ? (
                <>
                  <CheckCircleIcon size={40} className="mx-auto text-green-600" />
                  <p className="text-green-700 font-medium">Correct! Great job.</p>
                </>
              ) : (
                <>
                  <XCircleIcon size={40} className="mx-auto text-red-600" />
                  <p className="text-red-700 font-medium">
                    Incorrect. The correct answer is{" "}
                    <strong>{correct_answer}</strong>.
                  </p>
                </>
              )}
              <p className="text-sm text-gray-600">{explanation}</p>

              <button
                onClick={handleRetry}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCwIcon size={18} className="mr-2" /> Try Another Quiz
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
