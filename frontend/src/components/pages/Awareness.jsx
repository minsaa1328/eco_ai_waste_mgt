import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon,
  ShareIcon,
  ThumbsUpIcon,
} from "lucide-react";

export const Awareness = () => {
  const location = useLocation();
  const { item, category } = location.state || {}; // ← received from Classifier navigation

  const [currentSlide, setCurrentSlide] = useState(0);
  const [ecoTips, setEcoTips] = useState([]);
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL + "/api/orchestrator";

  useEffect(() => {
    const fetchAwarenessData = async () => {
      try {
        setLoading(true);

        // Use item/category if passed from Classifier, else default context
        const contextText = category
          ? `Awareness information about ${category} waste`
          : item
          ? `Environmental awareness related to ${item}`
          : "environmental sustainability and waste management";

        const payload = {
          task: "custom",
          need: ["awareness"],
          payload: { context: contextText },
        };

        const res = await axios.post(`${API_URL}/handle`, payload);
        const steps = res.data.steps || [];
        const awarenessStep = steps.find((s) => s.agent.toLowerCase() === "awareness");
        const output = awarenessStep?.output || "";

        if (!output) {
          setError("No awareness content received from backend.");
          return;
        }

        // Split the raw LLM text into structured parts
        const paragraphs = output
          .split(/\n+/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        // Build slide data
        const generatedTips = paragraphs.map((p, i) => ({
          title: `Eco Insight ${i + 1}`,
          content: p,
          category: category || "General Awareness",
          image: `https://source.unsplash.com/600x400/?${category || "eco"},environment,awareness,${i}`,
        }));
        setEcoTips(generatedTips);

        // Short facts
        const shortFacts = paragraphs
          .filter((p) => p.split(" ").length < 20)
          .slice(0, 5)
          .map((f, i) => ({
            fact: f,
            source: "Eco AI Awareness Agent",
            category: category || "Sustainability",
          }));
        setFacts(shortFacts);
      } catch (err) {
        console.error("Failed to load awareness data:", err);
        setError("Failed to connect to backend awareness agent.");
      } finally {
        setLoading(false);
      }
    };

    fetchAwarenessData();
  }, [item, category]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === ecoTips.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? ecoTips.length - 1 : prev - 1));
  };

  // 🌀 Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600 animate-pulse">
          Loading awareness content...
        </p>
      </div>
    );
  }

  // ⚠️ Error / Empty
  if (error || ecoTips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-3">
        <p className="text-gray-700 font-medium">
          {error || "No awareness content available at the moment."}
        </p>
        <p className="text-sm text-gray-500">
          Make sure your <code>AwarenessCrew</code> returns valid text.
        </p>
      </div>
    );
  }

  const currentTip = ecoTips[currentSlide];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Environmental Awareness
      </h1>

      {/* 🌍 Awareness Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="relative">
              <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
                <img
                  src={currentTip.image}
                  alt={currentTip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <Badge color="green" className="mb-2 w-fit">
                    {currentTip.category}
                  </Badge>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {currentTip.title}
                  </h3>
                  <p className="mt-2 text-white/90">{currentTip.content}</p>
                </div>
              </div>

              {/* Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors"
              >
                <ChevronLeftIcon size={24} className="text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors"
              >
                <ChevronRightIcon size={24} className="text-white" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {ecoTips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === index
                        ? "w-6 bg-white"
                        : "w-2 bg-white/50"
                    }`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-between">
              <div className="flex space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <BookmarkIcon size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <ShareIcon size={20} className="text-gray-600" />
                </button>
              </div>
              <button className="flex items-center space-x-1 text-green-600">
                <ThumbsUpIcon size={18} />
                <span>Helpful</span>
              </button>
            </div>
          </Card>
        </div>

        {/* 🌱 Quick Facts */}
        <div>
          <Card title="Did You Know?">
            {facts.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">
                No short eco facts available from backend.
              </div>
            ) : (
              <div className="space-y-4">
                {facts.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">{item.fact}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge color="blue" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Source: {item.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
