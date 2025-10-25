import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { MessageCircle, Send, Trash2, X, Loader2 } from 'lucide-react';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../../api/chat';
import { Card } from '../ui/Card';

export const ChatAssistant = ({ recyclingGuide = null, wasteCategory = null, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { getToken } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  // Add initial recycling guide message when provided
  useEffect(() => {
    if (recyclingGuide && isOpen) {
      const hasGuideMessage = messages.some(m => m.recycling_guide === recyclingGuide);
      if (!hasGuideMessage) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `I can help you understand this recycling guide for ${wasteCategory || 'this item'}. Ask me anything about how to recycle it safely!`,
            recycling_guide: recyclingGuide,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    }
  }, [recyclingGuide, isOpen]);

  const loadChatHistory = async () => {
    try {
      setHistoryLoading(true);
      const token = await getToken();
      const data = await getChatHistory(token, 5);

      if (data.history && data.history.length > 0) {
        const formattedHistory = data.history.flatMap(item => [
          { role: 'user', content: item.user_message, timestamp: item.timestamp },
          { role: 'assistant', content: item.assistant_response, timestamp: item.timestamp }
        ]);
        setMessages(formattedHistory);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to UI
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    try {
      setLoading(true);
      const token = await getToken();

      const response = await sendChatMessage(
        token,
        userMessage,
        recyclingGuide,
        wasteCategory
      );

      // Add assistant response to UI
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        metadata: response.metadata,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Chat failed:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your chat history?')) return;

    try {
      const token = await getToken();
      await clearChatHistory(token);
      setMessages([]);
      alert('Chat history cleared successfully!');
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear chat history.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <MessageCircle className="text-green-600" size={24} />
            <div>
              <h2 className="text-lg font-semibold">Recycling Assistant</h2>
              {wasteCategory && (
                <p className="text-sm text-gray-600">Discussing: {wasteCategory}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearHistory}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Clear chat history"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {historyLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle size={48} className="mb-2" />
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white'
                      : msg.isError
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.metadata?.has_guide_context && (
                    <p className="text-xs mt-2 opacity-70">
                      📋 Using recycling guide context
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about recycling..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Ask "How do I recycle this safely?" or "Where can I dispose of this?"
          </p>
        </div>
      </Card>
    </div>
  );
};

