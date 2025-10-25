import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Card } from "../ui/Card.jsx";
import { sendChatMessage, getChatHistory } from "../../api/chat.js";
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  PrinterIcon,
  ShareIcon,
  SendIcon,
  MicIcon,
  LightbulbIcon,
  BotIcon,
  UserIcon,
  BatteryChargingIcon,
  LeafIcon,
  TrashIcon,
  TrophyIcon,
  MessageCircle,
} from "lucide-react";
import { useAuth } from '@clerk/clerk-react';

export const RecyclingGuide = () => {
  const location = useLocation();
  const { item, category } = location.state || {}; // ← Data passed from Classifier
  const [selectedCategory, setSelectedCategory] = useState(category || "plastic");
  const [showChat, setShowChat] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);
  const [dynamicGuide, setDynamicGuide] = useState(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [recyclingGuideText, setRecyclingGuideText] = useState(null);

  // Chat state for inline chat UI
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const { getToken } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL + "/api/orchestrator";

  const ecoFacts = [
    "Recycling one aluminum can saves enough energy to power a TV for 3 hours.",
    "The average person generates over 4 pounds of trash every day.",
    "Glass bottles can take up to 1 million years to decompose naturally.",
    "About 8 million metric tons of plastic enter our oceans every year.",
    "Paper can be recycled up to 7 times before the fibers become too short.",
    "Recycling one ton of paper saves 17 trees and 7,000 gallons of water.",
  ];

  const suggestedPrompts = [
    { text: "How do I recycle plastic bottles correctly?", icon: <BatteryChargingIcon size={14} className="text-blue-600" /> },
    { text: "What is e-waste and how can I dispose of it?", icon: <BatteryChargingIcon size={14} className="text-red-600" /> },
    { text: "Explain composting in simple terms.", icon: <LeafIcon size={14} className="text-green-600" /> },
    { text: "Which materials are not recyclable?", icon: <TrashIcon size={14} className="text-gray-600" /> },
  ];

  const categories = [
    { id: "plastic", name: "Plastic", color: "blue" },
    { id: "paper", name: "Paper", color: "green" },
    { id: "organic", name: "Organic", color: "green" },
    { id: "metal", name: "Metal", color: "yellow" },
    { id: "ewaste", name: "E-Waste", color: "red" },
  ];

  // 🧠 Auto-fetch guide if navigated from Classifier
  useEffect(() => {
    if (category || item) fetchInitialGuide();
  }, [category, item]);

  // 📜 Load chat history when chat is opened
  useEffect(() => {
    if (showChat && chatMessages.length === 0) {
      loadChatHistory();
    }
  }, [showChat]);

  // 📜 Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const loadChatHistory = async () => {
    try {
      setChatLoading(true);
      const token = await getToken();
      const data = await getChatHistory(token, 10);

      if (data.history && data.history.length > 0) {
        const formattedHistory = data.history.flatMap(item => [
          { sender: 'user', text: item.user_message, timestamp: new Date(item.timestamp) },
          { sender: 'ai', text: item.assistant_response, timestamp: new Date(item.timestamp) }
        ]);
        setChatMessages(formattedHistory);
      } else {
        // Welcome message if no history
        setChatMessages([{
          sender: "ai",
          text: "Hello! I'm your EcoGuide Assistant. Ask me anything about waste management, recycling, or eco-awareness!",
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      setChatMessages([{
        sender: "ai",
        text: "Hello! I'm your EcoGuide Assistant. Ask me anything about waste management, recycling, or eco-awareness!",
        timestamp: new Date(),
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchInitialGuide = async () => {
    try {
      setLoadingGuide(true);
      const token = await getToken();
      const payload = {
        task: "custom",
        need: ["recycle", "awareness"],
        payload: {
          item: item || "waste item",
          category: category || selectedCategory,
          location: "Eco City",
        },
      };

      const res = await axios.post(`${API_URL}/handle`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const steps = res.data.steps || [];

      const recyclingStep = steps.find((s) => s.agent.toLowerCase() === "recycling");
      const awarenessStep = steps.find((s) => s.agent.toLowerCase() === "awareness");

      const combinedOutput = {
        recycling: recyclingStep?.output || "No recycling guide found.",
        awareness: awarenessStep?.output || "No awareness tip found.",
      };

      setDynamicGuide(combinedOutput);
      // Store recycling guide for Chat Assistant
      setRecyclingGuideText(recyclingStep?.output || null);
    } catch (error) {
      console.error("Initial guide fetch failed:", error);
    } finally {
      setLoadingGuide(false);
    }
  };

  // 💬 Send message using new Chat Assistant API
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      sender: "user",
      text: inputMessage,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const token = await getToken();

      // Use new Chat Assistant API
      const response = await sendChatMessage(
        token,
        inputMessage,
        recyclingGuideText,
        category || selectedCategory
      );

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: response.response,
          timestamp: new Date(),
        },
      ]);

      setCurrentFact((prev) => (prev + 1) % ecoFacts.length);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ Sorry, I couldn't reach the backend. Please check your server.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setInputMessage(prompt);
    setTimeout(() => handleSendMessage(), 300);
  };

  const currentGuide = {
    title: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Recycling Guide`,
    description: dynamicGuide
      ? "Here's an AI-generated guide and awareness insight based on your item."
      : `Learn how to recycle ${selectedCategory} items responsibly.`,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Recycling Guide</h1>

      {/* Category Toggle */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === cat.id
                ? `bg-${cat.color}-100 text-${cat.color}-800 border border-${cat.color}-300`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
        <button
          onClick={() => setShowChat(!showChat)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showChat
              ? "bg-orange-100 text-orange-800 border border-orange-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {showChat ? "View Guide" : "Chat Assistant"}
        </button>
      </div>

      {!showChat ? (
        /* 📘 AI-Generated Guide View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{currentGuide.title}</h2>
                <p className="mt-2 text-gray-600">{currentGuide.description}</p>
              </div>

              {loadingGuide ? (
                <p className="text-gray-500">Loading recycling guide...</p>
              ) : dynamicGuide ? (
                <div className="space-y-4 text-gray-700">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-line">
                    {dynamicGuide.recycling}
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 whitespace-pre-line">
                    {dynamicGuide.awareness}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Select a category or chat to get started.</p>
              )}
            </div>
          </Card>

          <Card title="Local Recycling Resources">
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Community Recycling Center</p>
                <p className="text-sm text-gray-600 mt-1">123 Green Street, Eco City</p>
                <p className="text-sm text-gray-600">Open: Mon-Sat, 8AM-6PM</p>
                <button className="mt-2 text-sm text-green-600 font-medium flex items-center">
                  Get directions <ArrowRightIcon size={14} className="ml-1" />
                </button>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">E-Waste Drop-off Point</p>
                <p className="text-sm text-gray-600 mt-1">456 Tech Avenue, Eco City</p>
                <p className="text-sm text-gray-600">Open: Wed-Sun, 10AM-4PM</p>
                <button className="mt-2 text-sm text-green-600 font-medium flex items-center">
                  Get directions <ArrowRightIcon size={14} className="ml-1" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* 💬 Inline Chat Mode with New Backend Integration */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex flex-col h-[600px]">
              {chatLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Loading chat history...</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-1 py-2 space-y-4">
                    {chatMessages.map((message, i) => (
                      <div key={i} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                            message.sender === "user"
                              ? "bg-[#FFF8E7] text-gray-800"
                              : "bg-[#E7F7E2] text-gray-800"
                          }`}
                        >
                          {message.sender === "ai" && (
                            <div className="flex items-center mb-1.5">
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                <BotIcon size={14} className="text-green-600" />
                              </div>
                              <span className="text-xs font-medium text-green-600">EcoGuide Assistant</span>
                            </div>
                          )}
                          {message.sender === "user" && (
                            <div className="flex items-center justify-end mb-1.5">
                              <span className="text-xs font-medium text-gray-600">You</span>
                              <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center ml-2">
                                <UserIcon size={14} className="text-amber-600" />
                              </div>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-line">{message.text}</p>
                          <div
                            className={`text-xs text-gray-500 mt-1 ${
                              message.sender === "user" ? "text-right" : "text-left"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[#E7F7E2] shadow-sm">
                          <div className="flex items-center mb-1.5">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                              <BotIcon size={14} className="text-green-600" />
                            </div>
                            <span className="text-xs font-medium text-green-600">EcoGuide Assistant</span>
                          </div>
                          <div className="flex space-x-1.5 items-center h-6">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="py-3 px-1 flex flex-wrap gap-2">
                    {suggestedPrompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => handlePromptClick(p.text)}
                        className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-1.5 rounded-full transition-colors"
                      >
                        <span className="mr-1.5">{p.icon}</span>
                        {p.text}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex items-center">
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <MicIcon size={20} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Ask anything about recycling..."
                        className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-[#FF8C42] text-white rounded-full hover:bg-orange-600 transition-colors"
                        onClick={handleSendMessage}
                      >
                        <SendIcon size={16} />
                      </button>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <LightbulbIcon size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card title="Recycling Quick Facts">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <LeafIcon size={20} className="text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Did you know?</p>
                    <p className="mt-1 text-sm text-green-700">{ecoFacts[currentFact]}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};