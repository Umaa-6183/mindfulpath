// /frontend/src/pages/Content/Meditation.jsx (FINAL CORRECTED)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import ChatBot from '../../components/ChatBot.jsx'; // <--- ChatBot Integrated
import '../../styles/theme.css'; 

// --- Static Educational Content (Fallback) ---
const MeditationEducationalContent = (
  <div className="space-y-10">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 border-t-4 border-indigo-500 transition-colors">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <span className="text-indigo-500 mr-3">✨</span>The Science and Practice of Meditation
      </h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        Meditation is the practice of training attention and awareness, and achieving a mentally clear and emotionally calm and stable state.
      </p>
    </div>
    <div className="bg-indigo-50 dark:bg-gray-700 rounded-xl p-6 shadow transition-colors">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔑 Starting Your Practice</h3>
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2 ml-4">
        <li><b>Find a Comfortable Seat:</b> Keep your spine straight but relaxed.</li>
        <li><b>Focus on the Anchor:</b> Use your breath as the point of focus.</li>
        <li><b>Return Gently:</b> When your mind wanders, bring it back without judgment.</li>
      </ul>
    </div>
  </div>
);

export default function MeditationContent() {
  const navigate = useNavigate();
  
  // Data State
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Session State
  const [activeSession, setActiveSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isNightMode, setIsNightMode] = useState(false); // Toggle for specific player UI

  // 1. Fetch Content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/content/media/by-type/meditation');
        setContent(response.data.content || []);
      } catch (err) {
        console.error('Error fetching Meditation content:', err);
        // Fallback Data
        setContent([
            { id: 1, title: 'Mindful Breathing', description: 'A basic practice to center your attention.', duration_minutes: 5, difficulty_level: 'Beginner' },
            { id: 2, title: 'Body Scan', description: 'Release tension from head to toe.', duration_minutes: 15, difficulty_level: 'All Levels' },
            { id: 3, title: 'Loving Kindness', description: 'Cultivate compassion for yourself and others.', duration_minutes: 10, difficulty_level: 'Intermediate' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // 2. Timer Logic
  useEffect(() => {
    let interval;
    if (activeSession && isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false); // Stop when finished
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, activeSession]);

  const handleStartSession = (item) => {
    setActiveSession(item);
    setTimeLeft(item.duration_minutes * 60);
    setIsPlaying(true);
    setIsNightMode(false); // Default to Day mode on start
    window.scrollTo(0, 0);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setActiveSession(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 3. Circular Progress Calculation
  const radius = 120; 
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = activeSession ? activeSession.duration_minutes * 60 : 1;
  const progress = activeSession ? ((totalSeconds - timeLeft) / totalSeconds) : 0;
  // Stroke offset logic: Start full, decrease as time passes (or vice versa depending on preference)
  // Here we make the orange ring grow or shrink. Let's make it shrink (countdown style).
  const strokeDashoffset = -1 * progress * circumference; 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  // --- RENDER: PLAYER VIEW (Active Session) ---
  if (activeSession) {
    // Dynamic Classes based on Night Mode
    const bgClass = isNightMode ? 'bg-gray-950' : 'bg-blue-50';
    const textClass = isNightMode ? 'text-blue-100 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-gray-900';
    const subTextClass = isNightMode ? 'text-blue-300' : 'text-gray-500';
    const containerClass = isNightMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-white shadow-xl';

    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-700 ease-in-out ${bgClass}`}>
        
        {/* Header */}
        <header className="px-6 py-6 flex justify-between items-center relative z-10 shrink-0">
          <button 
            onClick={() => setIsNightMode(!isNightMode)} 
            className={`text-sm font-semibold px-4 py-2 rounded-full transition-all border ${isNightMode ? 'bg-gray-800 text-blue-200 border-blue-900 hover:bg-gray-700' : 'bg-white text-indigo-700 border-indigo-100 hover:bg-indigo-50 shadow-sm'}`}
          >
            {isNightMode ? '☀️ Day Mode' : '🌙 Night Mode'}
          </button>
          
          <div className="flex flex-col items-center">
             {/* Small Title in Header */}
             <span className={`font-bold ${textClass}`}>{activeSession.title}</span>
          </div>

          <button 
            onClick={handleClosePlayer} 
            className={`text-2xl font-bold transition hover:scale-110 ${isNightMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
          >
            ✕
          </button>
        </header>

        {/* Main Content: Split Screen */}
        <main className="flex-grow flex flex-col lg:flex-row p-6 gap-6 max-w-7xl mx-auto w-full relative z-10">
          
          {/* Left Column: Circular Timer */}
          <div className="w-full lg:w-2/3 flex flex-col items-center justify-center">
            
            <div className="text-center mb-10">
              <h1 className={`text-4xl font-bold mb-2 transition-all duration-700 ${textClass}`}>{isPlaying ? 'Breathe...' : 'Paused'}</h1>
              <p className={`${subTextClass} text-lg transition-colors duration-700`}>Focus on the present moment</p>
            </div>

            {/* SVG TIMER RING */}
            <div className="relative w-80 h-80 flex items-center justify-center mb-12">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                <defs>
                  {/* Orange Gradient Definition */}
                  <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" /> {/* Orange-500 */}
                    <stop offset="100%" stopColor="#fb923c" /> {/* Orange-400 */}
                  </linearGradient>
                </defs>
                
                {/* Track Circle (Background) */}
                <circle cx="50%" cy="50%" r={radius} fill="transparent" stroke={isNightMode ? "#1e293b" : "#e2e8f0"} strokeWidth="8" />
                
                {/* Progress Circle (Orange Gradient) */}
                <circle 
                    cx="50%" cy="50%" r={radius} 
                    fill="transparent" 
                    stroke="url(#orangeGradient)" 
                    strokeWidth="12" 
                    strokeLinecap="round" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    className="transition-all duration-1000 ease-linear" 
                />
              </svg>
              
              {/* Center Countdown Numbers */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-6xl font-mono font-light tracking-tighter ${isNightMode ? 'text-white drop-shadow-lg' : 'text-gray-800'}`}>
                    {formatTime(timeLeft)}
                </span>
                <span className={`text-sm mt-2 uppercase tracking-widest ${subTextClass}`}>Remaining</span>
              </div>
            </div>

            {/* Controls (Orange) */}
            <div className="flex items-center gap-8">
              <button 
                className={`p-4 rounded-full border-2 transition ${isNightMode ? 'border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-white' : 'border-gray-200 text-gray-400 hover:bg-white hover:text-indigo-600'}`} 
                onClick={() => setTimeLeft(Math.min(activeSession.duration_minutes * 60, timeLeft + 15))}
              >
                ⏪ 15s
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-5xl shadow-xl hover:scale-105 hover:shadow-orange-500/50 transition transform"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              
              <button 
                className={`p-4 rounded-full border-2 transition ${isNightMode ? 'border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-white' : 'border-gray-200 text-gray-400 hover:bg-white hover:text-indigo-600'}`} 
                onClick={() => setTimeLeft(Math.max(0, timeLeft - 15))}
              >
                15s ⏩
              </button>
            </div>
          </div>

          {/* Right Column: AI Coach */}
          <div className="w-full lg:w-1/3 h-[500px] lg:h-auto">
            <div className={`rounded-2xl h-full overflow-hidden border transition-colors duration-700 ${containerClass}`}>
              <ChatBot 
                isEmbedded={true} 
                persona="meditation" 
                contextualData={{ session: activeSession.title }}
              />
            </div>
          </div>

        </main>
        
        {/* Night Mode Ambient Glow Effect */}
        {isNightMode && (
             <div className="absolute inset-0 bg-indigo-900 opacity-10 pointer-events-none mix-blend-screen blur-3xl"></div>
        )}
      </div>
    );
  }

  // --- RENDER: LIST VIEW (Default Dashboard) ---
  return (
    // Replaced min-h-screen/bg-gray-50 with simple div because App.jsx handles layout
    <div className="flex flex-col gap-6">
      
      {/* Header - Card Style */}
      <header className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg rounded-2xl p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
             <span className="text-4xl">🧘‍♂️</span>
             <div>
                <h1 className="text-2xl font-bold">Meditation</h1>
                <p className="text-white/80 text-sm">Calm, clarity & deep peace</p>
             </div>
        </div>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition backdrop-blur-sm">
            ← Dashboard
        </button>
      </header>

      <main className="w-full">
        {content.length === 0 ? MeditationEducationalContent : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition cursor-pointer border border-gray-100 dark:border-gray-700" onClick={() => handleStartSession(item)}>
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <span className="text-6xl drop-shadow-lg">🧘‍♂️</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">⏱️ {item.duration_minutes} min</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 rounded-full font-medium">{item.difficulty_level}</span>
                    </div>
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