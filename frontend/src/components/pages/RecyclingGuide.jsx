import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, ArrowRightIcon, PrinterIcon, ShareIcon, SendIcon, MicIcon, LightbulbIcon, BotIcon, UserIcon, BatteryChargingIcon, LeafIcon, TrashIcon, TrophyIcon } from 'lucide-react';
export const RecyclingGuide = () => {
  const [selectedCategory, setSelectedCategory] = useState('plastic');
  const [chatMessages, setChatMessages] = useState([{
    sender: 'ai',
    text: "Hello! I'm your recycling assistant. Ask me anything about waste management and recycling!",
    timestamp: new Date()
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef(null);
  const [currentFact, setCurrentFact] = useState(0);
  const ecoFacts = ['Recycling one aluminum can saves enough energy to power a TV for 3 hours.', 'The average person generates over 4 pounds of trash every day.', 'Glass bottles can take up to 1 million years to decompose naturally.', 'About 8 million metric tons of plastic enter our oceans every year.', 'Paper can be recycled up to 7 times before the fibers become too short.', 'Recycling one ton of paper saves 17 trees and 7,000 gallons of water.'];
  const suggestedPrompts = [{
    text: 'How do I recycle plastic bottles correctly?',
    icon: <div size={14} className="text-blue-600" />
  }, {
    text: 'What is e-waste and how can I dispose of it?',
    icon: <BatteryChargingIcon size={14} className="text-red-600" />
  }, {
    text: 'Explain composting in simple terms.',
    icon: <LeafIcon size={14} className="text-green-600" />
  }, {
    text: 'Which materials are not recyclable?',
    icon: <TrashIcon size={14} className="text-gray-600" />
  }];
  const categories = [{
    id: 'plastic',
    name: 'Plastic',
    color: 'blue'
  }, {
    id: 'paper',
    name: 'Paper',
    color: 'green'
  }, {
    id: 'organic',
    name: 'Organic',
    color: 'green'
  }, {
    id: 'metal',
    name: 'Metal',
    color: 'yellow'
  }, {
    id: 'ewaste',
    name: 'E-Waste',
    color: 'red'
  }];
  const guides = {
    plastic: {
      title: 'Plastic Recycling Guide',
      description: 'Plastic recycling helps reduce pollution and conserves resources. Follow these steps to properly recycle plastic items.',
      steps: [{
        text: 'Empty and rinse the container to remove food residue',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1621265010303-a1585a43c19f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Remove labels and adhesives if possible',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Check the recycling number (1-7) on the bottom',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1605618826115-fb9e775cf15d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Compress containers to save space',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1611285340171-9e9c5ea7271a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Place in the designated recycling bin',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }],
      warnings: ['Plastic bags and films often require special recycling', 'Styrofoam may not be accepted in regular recycling']
    },
    paper: {
      title: 'Paper Recycling Guide',
      description: 'Paper is one of the most recycled materials. Follow these steps to ensure proper paper recycling.',
      steps: [{
        text: 'Remove any non-paper materials (plastic, staples)',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1607703829739-c05b7beddf60?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Keep paper clean and dry',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1598620617148-c9e8ddee6711?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Separate glossy magazines from regular paper',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1603039078583-13468e35b7b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Flatten cardboard boxes',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1607583444857-cc52f7802428?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Place in paper recycling bin',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1605600659892-ec64d010bbe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }],
      warnings: ['Shredded paper may require special handling', 'Food-soiled paper should be composted, not recycled']
    },
    organic: {
      title: 'Organic Waste Guide',
      description: 'Composting organic waste reduces landfill use and creates valuable soil amendments.',
      steps: [{
        text: 'Separate food scraps from other waste',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1604069850644-c77c231bce5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Include fruit/vegetable scraps, coffee grounds, eggshells',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1591034077625-6d0278b1d4af?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Add yard waste like leaves and small plant trimmings',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1593100126453-19b562a800c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Keep a balance of "green" and "brown" materials',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1591634616938-1dde473609a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Place in compost bin or municipal organic waste collection',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }],
      warnings: ['Avoid meat, dairy, and oily foods in home compost', 'Pet waste should not be composted']
    },
    metal: {
      title: 'Metal Recycling Guide',
      description: 'Metal recycling saves significant energy and natural resources. Follow these steps for proper metal recycling.',
      steps: [{
        text: 'Rinse containers to remove food residue',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1621265010303-a1585a43c19f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Separate different types of metals when possible',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1620625515032-6ed605ad0b90?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Remove non-metal parts if easily separable',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1605600659892-ec64d010bbe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Crush aluminum cans to save space (optional)',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1550411294-56c7b7ecd293?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Place in metal recycling bin',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1605600659892-ec64d010bbe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }],
      warnings: ['Aerosol cans must be completely empty', 'Some metal items may require special handling']
    },
    ewaste: {
      title: 'E-Waste Recycling Guide',
      description: 'Electronic waste contains hazardous materials and valuable resources. Special handling is required.',
      steps: [{
        text: 'Back up and erase personal data from devices',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Remove batteries if possible (they require separate recycling)',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1584383129963-f84e0c1ce8e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Do not break or crush electronics',
        icon: <XCircleIcon size={20} className="text-red-500" />,
        image: 'https://images.unsplash.com/photo-1605600659927-2f6d25427f5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Find a certified e-waste recycler or drop-off location',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }, {
        text: 'Consider donating working electronics',
        icon: <CheckCircleIcon size={20} className="text-green-500" />,
        image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      }],
      warnings: ['Never dispose of e-waste in regular trash', 'Some retailers offer take-back programs']
    }
  };
  // Simulated AI response based on user question
  const getAIResponse = question => {
    const responses = {
      'how do i recycle plastic bottles correctly?': "To recycle plastic bottles correctly: 1) Empty and rinse them thoroughly, 2) Remove caps and labels if your local facility requires it, 3) Check the recycling number (1-7) at the bottom to ensure it's accepted, 4) Flatten to save space, and 5) Place in your recycling bin. Remember that some facilities accept caps when they're screwed back onto bottles!",
      'what is e-waste and how can i dispose of it?': 'E-waste refers to discarded electronic devices like computers, phones, and TVs. These contain hazardous materials and valuable resources. To dispose of e-waste properly: 1) Never throw it in regular trash, 2) Erase personal data, 3) Find a certified e-waste recycler, 4) Check if manufacturers or retailers have take-back programs, or 5) Donate working electronics to extend their useful life.',
      'explain composting in simple terms.': "Composting is nature's recycling system for organic materials! It's the process of turning food scraps and yard waste into nutrient-rich soil. You collect things like fruit peels, vegetable scraps, coffee grounds, and yard trimmings in a bin or pile, keep it slightly moist, turn it occasionally, and over time (usually a few months), microorganisms break it down into compost – a dark, crumbly material that's excellent for gardens and plants.",
      'which materials are not recyclable?': 'Common non-recyclable items include: 1) Soiled paper products like greasy pizza boxes, 2) Certain plastics like plastic bags, straws, and utensils, 3) Styrofoam, 4) Ceramics and pyrex glass, 5) Mixed material packaging (like juice boxes with foil inside), 6) Tissues, napkins, and paper towels, 7) Food waste (though it can be composted), and 8) Hazardous waste like batteries and paint. Always check your local recycling guidelines as they vary by location.',
      default: "That's a great question about recycling! While I don't have a specific answer prepared for this exact question, I recommend checking your local recycling guidelines as they can vary by location. You can usually find this information on your city or waste management company's website. Is there something specific about this topic you'd like to know more about?"
    };
    // Convert to lowercase and remove punctuation for matching
    const normalizedQuestion = question.toLowerCase().replace(/[^\w\s]/g, '');
    // Check for keyword matches
    for (const key in responses) {
      if (key !== 'default' && normalizedQuestion.includes(key.replace(/[^\w\s]/g, ''))) {
        return responses[key];
      }
    }
    return responses['default'];
  };
  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    // Add user message
    const userMessage = {
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    // Simulate AI thinking and responding
    setTimeout(() => {
      const aiResponse = {
        sender: 'ai',
        text: getAIResponse(inputMessage.toLowerCase()),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      // Update the eco fact
      setCurrentFact(prev => (prev + 1) % ecoFacts.length);
    }, 1500);
  };
  const handlePromptClick = prompt => {
    setInputMessage(prompt);
    // Auto-send after a short delay
    setTimeout(() => {
      handleSendMessage();
    }, 300);
  };
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [chatMessages]);
  const currentGuide = guides[selectedCategory];
  return <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Recycling Guide</h1>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === category.id ? `bg-${category.color}-100 text-${category.color}-800 border border-${category.color}-300` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {category.name}
          </button>)}
        <button onClick={() => setShowChat(!showChat)} className={`px-4 py-2 rounded-lg transition-colors ${showChat ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          {showChat ? 'View Guide' : 'Chat Assistant'}
        </button>
      </div>
      {!showChat ? <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {currentGuide.title}
                </h2>
                <p className="mt-2 text-gray-600">{currentGuide.description}</p>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">
                  Step-by-Step Instructions:
                </h3>
                <div className="space-y-4">
                  {currentGuide.steps.map((step, index) => <div key={index} className="flex flex-col md:flex-row items-start p-4 bg-gray-50 rounded-lg">
                      {step.image && <div className="w-full md:w-24 h-24 rounded-lg overflow-hidden mb-3 md:mb-0 md:mr-4 flex-shrink-0">
                          <img src={step.image} alt={`Step ${index + 1}`} className="w-full h-full object-cover" />
                        </div>}
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">{step.icon}</div>
                        <p className="ml-3 text-gray-700">{step.text}</p>
                      </div>
                    </div>)}
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex">
                  <AlertTriangleIcon size={20} className="text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">
                      Important Notes
                    </p>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                      {currentGuide.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <PrinterIcon size={18} className="mr-2" />
                  Print Guide
                </button>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <ShareIcon size={18} className="mr-2" />
                  Share Guide
                </button>
              </div>
            </div>
          </Card>
          <Card title="Local Recycling Resources">
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Community Recycling Center</p>
                <p className="text-sm text-gray-600 mt-1">
                  123 Green Street, Eco City
                </p>
                <p className="text-sm text-gray-600">Open: Mon-Sat, 8AM-6PM</p>
                <button className="mt-2 text-sm text-green-600 font-medium flex items-center">
                  Get directions <ArrowRightIcon size={14} className="ml-1" />
                </button>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">E-Waste Drop-off Point</p>
                <p className="text-sm text-gray-600 mt-1">
                  456 Tech Avenue, Eco City
                </p>
                <p className="text-sm text-gray-600">Open: Wed-Sun, 10AM-4PM</p>
                <button className="mt-2 text-sm text-green-600 font-medium flex items-center">
                  Get directions <ArrowRightIcon size={14} className="ml-1" />
                </button>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Composting Workshop</p>
                <p className="text-sm text-gray-600 mt-1">
                  Every Saturday, 10AM
                </p>
                <p className="text-sm text-gray-600">
                  Community Garden, Eco City
                </p>
                <button className="mt-2 text-sm text-green-600 font-medium flex items-center">
                  Register <ArrowRightIcon size={14} className="ml-1" />
                </button>
              </div>
              <button className="w-full py-2 text-sm text-green-600 hover:text-green-800 font-medium">
                View all local resources
              </button>
            </div>
          </Card>
        </div> : <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <div className="flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto px-1 py-2">
                <div className="space-y-4">
                  {chatMessages.map((message, index) => <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'user' ? 'bg-[#FFF8E7] text-gray-800' : 'bg-[#E7F7E2] text-gray-800'}`}>
                        {message.sender === 'ai' && <div className="flex items-center mb-1.5">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                              <BotIcon size={14} className="text-green-600" />
                            </div>
                            <span className="text-xs font-medium text-green-600">
                              EcoGuide Assistant
                            </span>
                          </div>}
                        {message.sender === 'user' && <div className="flex items-center justify-end mb-1.5">
                            <span className="text-xs font-medium text-gray-600">
                              You
                            </span>
                            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center ml-2">
                              <UserIcon size={14} className="text-amber-600" />
                            </div>
                          </div>}
                        <p className="text-sm">{message.text}</p>
                        <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                          {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                        </div>
                      </div>
                    </div>)}
                  {isTyping && <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[#E7F7E2] shadow-sm">
                        <div className="flex items-center mb-1.5">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                            <BotIcon size={14} className="text-green-600" />
                          </div>
                          <span className="text-xs font-medium text-green-600">
                            EcoGuide Assistant
                          </span>
                        </div>
                        <div className="flex space-x-1.5 items-center h-6">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{
                      animationDelay: '0ms'
                    }}></div>
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{
                      animationDelay: '150ms'
                    }}></div>
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{
                      animationDelay: '300ms'
                    }}></div>
                        </div>
                      </div>
                    </div>}
                  <div ref={chatEndRef} />
                </div>
              </div>
              {/* Suggested prompts */}
              <div className="py-3 px-1">
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, index) => <button key={index} onClick={() => handlePromptClick(prompt.text)} className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-1.5 rounded-full transition-colors">
                      <span className="mr-1.5">{prompt.icon}</span>
                      {prompt.text.length > 25 ? prompt.text.substring(0, 25) + '...' : prompt.text}
                    </button>)}
                </div>
              </div>
              {/* Input area */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center">
                  <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <MicIcon size={20} />
                  </button>
                  <div className="flex-1 relative">
                    <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={e => {
                  if (e.key === 'Enter') handleSendMessage();
                }} placeholder="Ask anything about recycling..." className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-[#FF8C42] text-white rounded-full hover:bg-orange-600 transition-colors" onClick={handleSendMessage}>
                      <SendIcon size={16} />
                    </button>
                  </div>
                  <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <LightbulbIcon size={20} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
          {/* Quick Facts Panel */}
          <Card title="Recycling Quick Facts">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <LeafIcon size={20} className="text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Did you know?
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      {ecoFacts[currentFact]}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Today's Recycling Tip</p>
                <p className="text-sm text-gray-600 mt-1">
                  Flatten cardboard boxes before recycling to save space in
                  collection bins and trucks.
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="font-medium text-blue-800">
                  Common Recycling Symbols
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="h-10 w-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-800 text-xs">♻️</span>
                    </div>
                    <p className="text-xs mt-1">Recyclable</p>
                  </div>
                  <div className="text-center">
                    <div className="h-10 w-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-800 text-xs">🟢</span>
                    </div>
                    <p className="text-xs mt-1">Compostable</p>
                  </div>
                  <div className="text-center">
                    <div className="h-10 w-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-800 text-xs">⚠️</span>
                    </div>
                    <p className="text-xs mt-1">Hazardous</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="font-medium text-yellow-800">
                  Recycling Achievement
                </p>
                <div className="flex items-center mt-2">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <TrophyIcon size={20} className="text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Recycling Rookie</p>
                    <p className="text-xs text-yellow-700">
                      You've learned 5 recycling facts!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>}
    </div>;
};