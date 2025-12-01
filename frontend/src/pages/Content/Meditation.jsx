// /frontend/src/pages/Content/Meditation.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import ChatBot from '../../components/ChatBot.jsx'; // <--- IMPORT ADDED

// ... (Keep existing MeditationEducationalContent) ...
const MeditationEducationalContent = (
  <div className="space-y-10">
    <div className="bg-white rounded-xl shadow-2xl p-8 border-t-4 border-indigo-500">
      <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="text-indigo-500 mr-3">✨</span>The Science and Practice of Meditation
      </h2>
      <p className="text-lg text-gray-700 leading-relaxed">Meditation is the practice of training attention...</p>
    </div>
    <div className="bg-purple-50 rounded-xl p-6 shadow">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🔑 Starting Your Practice</h3>
      <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
        <li>**Find a Comfortable Seat:** Keep your spine straight but relaxed.</li>
        <li>**Focus on the Anchor:** Use your breath as the point of focus.</li>
      </ul>
    </div>
  </div>
);

export default function MeditationContent() {
  const navigate = useNavigate();
  // ... (Keep existing state) ...
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isNightMode, setIsNightMode] = useState(false);

  // ... (Keep existing fetch, timer, handlers, formatTime, circular logic) ...
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/content/media/by-type/meditation');
        setContent(response.data.content || []);
      } catch (err) {
        console.error('Error fetching Meditation content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    let interval;
    if (activeSession && isPlaying && timeLeft > 0) {
      interval = setInterval(() => { setTimeLeft((prev) => prev - 1); }, 1000);
    } else if (timeLeft === 0) { setIsPlaying(false); }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, activeSession]);

  const handleStartSession = (item) => {
    setActiveSession(item);
    setTimeLeft(item.duration_minutes * 60);
    setIsPlaying(true);
    setIsNightMode(false);
    window.scrollTo(0, 0);
  };

  const handleClosePlayer = () => { setIsPlaying(false); setActiveSession(null); };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const radius = 120; 
  const circumference = 2 * Math.PI * radius;
  const progress = activeSession ? ((activeSession.duration_minutes * 60 - timeLeft) / (activeSession.duration_minutes * 60)) : 0;
  const strokeDashoffset = circumference - progress * circumference;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div></div>;
  }

  // --- RENDER: PLAYER VIEW ---
  if (activeSession) {
    const bgClass = isNightMode ? 'bg-gray-900' : 'bg-gradient-to-b from-purple-50 to-white';
    const textClass = isNightMode ? 'text-blue-100' : 'text-gray-900';
    const subTextClass = isNightMode ? 'text-blue-300' : 'text-gray-500';
    const closeBtnClass = isNightMode ? 'text-blue-300 hover:text-white' : 'text-gray-500 hover:text-purple-600';

    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-700 ease-in-out ${bgClass}`}>
        
        {/* Header */}
        <header className="px-6 py-6 flex justify-between items-center relative z-10 shrink-0">
          <button onClick={() => setIsNightMode(!isNightMode)} className={`text-sm font-semibold px-4 py-2 rounded-full transition-all ${isNightMode ? 'bg-gray-800 text-blue-200 border border-blue-900' : 'bg-white text-purple-700 shadow-sm border border-purple-100'}`}>
            {isNightMode ? '☀️ Day Mode' : '🌙 Night Mode'}
          </button>
          <button onClick={handleClosePlayer} className={`text-2xl font-bold transition ${closeBtnClass}`}>✕</button>
        </header>

        {/* Main Content: Split Screen */}
        <main className="flex-grow flex flex-col lg:flex-row p-6 gap-6 max-w-7xl mx-auto w-full relative z-10">
          
          {/* Left Column: Circular Timer */}
          <div className="w-full lg:w-2/3 flex flex-col items-center justify-center">
            <div className="text-center mb-10">
              <h1 className={`text-3xl font-bold mb-2 ${textClass}`}>{activeSession.title}</h1>
              <p className={`${subTextClass} text-lg`}>Focus on your breath</p>
            </div>

            <div className="relative w-80 h-80 flex items-center justify-center mb-12">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                <defs>
                  <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
                <circle cx="50%" cy="50%" r={radius} fill="transparent" stroke={isNightMode ? "#1e293b" : "#e2e8f0"} strokeWidth="12" />
                <circle cx="50%" cy="50%" r={radius} fill="transparent" stroke="url(#orangeGradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-linear" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-6xl font-mono font-light ${isNightMode ? 'text-white' : 'text-gray-800'}`}>{formatTime(timeLeft)}</span>
                <span className={`text-sm mt-2 uppercase tracking-widest ${subTextClass}`}>Remaining</span>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <button className={`p-4 rounded-full border-2 transition ${isNightMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-400 hover:bg-gray-100'}`} onClick={() => setTimeLeft(Math.min(activeSession.duration_minutes * 60, timeLeft + 15))}>⏪ 15s</button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white flex items-center justify-center text-5xl shadow-xl hover:scale-105 transition transform">{isPlaying ? '⏸' : '▶'}</button>
              <button className={`p-4 rounded-full border-2 transition ${isNightMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-400 hover:bg-gray-100'}`} onClick={() => setTimeLeft(Math.max(0, timeLeft - 15))}>15s ⏩</button>
            </div>
          </div>

          {/* Right Column: AI Coach */}
          <div className="w-full lg:w-1/3 h-[500px] lg:h-auto">
            <div className={`rounded-2xl shadow-lg h-full overflow-hidden border ${isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              {/* <--- AI INTEGRATION HERE ---> */}
              <ChatBot 
                isEmbedded={true} 
                persona="meditation" 
                contextualData={{ session: activeSession.title }}
              />
            </div>
          </div>

        </main>
        
        {isNightMode && <div className="absolute inset-0 bg-blue-900 opacity-10 pointer-events-none mix-blend-screen blur-3xl"></div>}
      </div>
    );
  }

  // --- RENDER: LIST VIEW (Default) ---
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-400 to-indigo-400 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button onClick={() => navigate('/dashboard')} className="mb-4 text-white hover:text-gray-200 font-semibold">← Back to Dashboard</button>
          <h1 className="text-4xl font-bold mb-2">🧘‍♂️ Meditation</h1>
          <p className="text-lg opacity-90">Guided practices for calm, clarity & deep peace</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {content.length === 0 ? MeditationEducationalContent : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer" onClick={() => handleStartSession(item)}>
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center"><span className="text-6xl">🧘‍♂️</span></div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500"><span>⏱️ {item.duration_minutes} min</span><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">{item.difficulty_level}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}