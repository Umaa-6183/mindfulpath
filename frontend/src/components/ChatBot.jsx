// /frontend/src/components/ChatBot.jsx

import React, { useState, useRef, useEffect } from 'react';
import api from '../config/api'; 
import { useTheme } from '../context/ThemeContext.jsx'; 

// 1. Import Language Utilities
import { useLanguage } from '../context/LanguageContext';

export default function ChatBot({ 
  persona = 'general', 
  contextualData = {}, 
  assessmentData = null, 
  isEmbedded = false // If true, it won't be a floating button
}) {
  
  // 2. Initialize Translation Hook
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(isEmbedded); // Starts open if embedded
  
  // 3. Translated Initial Message
  // Note: We use a function or useEffect for state if we want it to update dynamically on language change,
  // but for the initial load, t() here works. For full reactivity, we can update messages in useEffect.
  const [messages, setMessages] = useState([
    { role: 'system', text: t('chatbot.welcome') || 'Hello! I am your MindfulPath Assistant. How can I help you today?' }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { isDarkMode } = useTheme(); 

  // Define appearance based on persona
  let headerTitle = t('chatbot.assistant') || 'MindfulPath Assistant';
  let headerIcon = '💬';

  if (persona === 'yoga') {
    headerTitle = t('chatbot.yogaCoach') || 'Yoga Coach';
    headerIcon = '🧘';
  } else if (persona === 'meditation') {
    headerTitle = t('chatbot.meditationGuide') || 'Meditation Guide';
    headerIcon = '🧘‍♂️';
  } else if (persona === 'nlp') {
    headerTitle = t('chatbot.nlpGuide') || 'NLP Journaling Guide';
    headerIcon = '🧠';
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle assessment-based welcome message (for specialized bots)
  useEffect(() => {
    if (isOpen && messages.length === 1 && assessmentData && assessmentData.low_score_domain) {
      // Note: constructing complex translated strings with variables is easier with template literals or a dedicated interpolation helper.
      // For simplicity here, we assume English structure or a simple append if specific translations aren't set up for this dynamic sentence.
      const welcomeText = t('chatbot.assessmentWelcome') 
        ? `${t('chatbot.assessmentWelcome')} **${assessmentData.low_score_domain}**. ${t('chatbot.goalAsk')}`
        : `Based on your low score in **${assessmentData.low_score_domain}**, I suggest we focus on a short exercise now. What's your current goal?`;

      const welcomeMsg = { 
        role: 'system', 
        text: welcomeText
      };
      setTimeout(() => setMessages(prev => [...prev, welcomeMsg]), 500); 
    }
  }, [isOpen, assessmentData, t]); // Added t dependency


  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Payload sent to the backend API endpoint
      const payload = {
        message: input,
        persona: persona,
        context: contextualData,
        assessment: assessmentData
      };
      
      // We assume your backend is listening on /api/v1/chat
      const response = await api.post('/chat', payload);
      
      const aiMsg = { role: 'system', text: response.data.reply };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Chat Error", error);
      const errorMsg = { role: 'system', text: t('chatbot.error') || "I'm having trouble connecting to the AI. Please ensure the backend is running." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // --- Base container classes ---
  const containerClasses = isEmbedded 
    ? "h-full w-full relative" 
    : "fixed bottom-6 right-6 z-50 flex flex-col items-end";
  
  const windowClasses = isEmbedded
    ? "w-full h-full rounded-none"
    : "mb-4 w-80 sm:w-96 h-96 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out transform origin-bottom-right";

  return (
    <div className={containerClasses}>
      
      {/* Chat Window */}
      {(isOpen || isEmbedded) && (
        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden ${windowClasses}`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{headerIcon}</span>
              <div>
                <h3 className="font-bold text-sm">{headerTitle}</h3>
                <p className="text-xs opacity-90">{t('chatbot.online') || "Online"}</p>
              </div>
            </div>
            {!isEmbedded && (
                <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                ✕
                </button>
            )}
            
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* --- CHAT BUBBLE STYLING --- */}
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md relative leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' // User: Blue bubble
                      : 'bg-orange-500 text-white rounded-tl-none' // AI/Coach: Orange bubble
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs p-2 rounded-xl animate-pulse">
                  {t('chatbot.thinking') || "Thinking..."}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${t('chatbot.ask') || "Ask your"} ${persona} ${t('chatbot.coach') || "coach"}...`}
              // Input text area styling (Spec: White bg, Black text)
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              disabled={loading}
            />
            {/* Orange send button */}
            <button 
              type="submit" 
              disabled={loading}
              className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition disabled:bg-gray-300"
            >
              {loading ? '...' : '➤'}
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button (Only if NOT embedded) */}
      {!isEmbedded && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-3xl text-white hover:scale-110 transition-transform duration-200"
        >
          {isOpen ? '✕' : '💬'}
        </button>
      )}

    </div>
  );
}