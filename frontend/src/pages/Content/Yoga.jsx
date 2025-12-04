// /frontend/src/pages/Content/Yoga.jsx (INTERACTIVE PLAYER UPDATE)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import ChatBot from '../../components/ChatBot.jsx'; 
import '../../styles/theme.css'; 

// --- Static Educational Content (Fallback) ---
const YogaEducationalContent = (
  <div className="space-y-10">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 border-t-4 border-teal-500 transition-colors">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <span className="text-teal-500 mr-3">✨</span>
        The Transformative Power of Yoga
      </h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        Yoga is an ancient discipline that brings together physical postures (<b>asanas</b>), breathing techniques (<b>pranayama</b>), and meditation. It fosters harmony between body, mind, and spirit.
      </p>
    </div>
    <div className="bg-green-50 dark:bg-gray-700 rounded-xl p-6 shadow transition-colors">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔑 Starting Your Yoga Flow</h3>
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2 ml-4">
        <li><b>Focus on the Breath:</b> Let your breath guide your movement.</li>
        <li><b>Find Your Edge:</b> Move into a stretch until you feel comfortable tension.</li>
      </ul>
    </div>
  </div>
);

export default function YogaContent() {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Session State
  const [activeSession, setActiveSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  // 1. Fetch Content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/content/media/by-type/yoga');
        setContent(response.data.content || []);
      } catch (err) {
        console.error('Error fetching Yoga content:', err);
        // Fallback data
        setContent([
            { id: 1, title: 'Morning Sun Salutation', description: 'Energize your body with this classic flow.', duration_minutes: 15, difficulty_level: 'Beginner' },
            { id: 2, title: 'Core Strength Vinyasa', description: 'Build heat and stability in your center.', duration_minutes: 20, difficulty_level: 'Intermediate' },
            { id: 3, title: 'Bedtime Deep Stretch', description: 'Release tension before sleep.', duration_minutes: 10, difficulty_level: 'Beginner' }
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
    if (activeSession && isPlaying && currentTime < (activeSession.duration_minutes * 60)) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const durationSecs = activeSession.duration_minutes * 60;
          const newTime = prev + 1;
          setProgress((newTime / durationSecs) * 100);
          return newTime;
        });
      }, 1000);
    } else if (activeSession && currentTime >= (activeSession.duration_minutes * 60)) {
      setIsPlaying(false);
      alert("Session Complete!");
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, activeSession]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartSession = (item) => {
    setActiveSession(item);
    setCurrentTime(0);
    setProgress(0);
    setIsPlaying(true);
    window.scrollTo(0, 0);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setActiveSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
      </div>
    );
  }

  // --- RENDER: PLAYER VIEW (Active Session) ---
  if (activeSession) {
    return (
      // Background: Light Blue (Investor Requirement)
      <div className="min-h-screen bg-blue-50 flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-4 flex justify-between items-center bg-white shadow-sm shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{activeSession.title}</h1>
            <p className="text-sm text-gray-500">
              {activeSession.instructor ? `with ${activeSession.instructor}` : 'Guided Flow'}
            </p>
          </div>
          <button 
            onClick={handleClosePlayer}
            className="text-gray-500 hover:text-orange-600 font-medium transition flex items-center gap-1"
          >
            <span className="text-xl">✕</span> Close
          </button>
        </header>

        {/* Main Content: Split Screen Layout */}
        <main className="flex-grow flex flex-col lg:flex-row p-6 gap-6 max-w-7xl mx-auto w-full">
          
          {/* Left Column: Player Visuals & Controls */}
          <div className="w-full lg:w-2/3 flex flex-col justify-between bg-white rounded-2xl shadow-lg p-8 h-full">
            
            {/* Visual Area: Black Outline with Orange Highlights (Investor Req) */}
            <div className="flex-grow flex items-center justify-center mb-8">
                <div className={`w-64 h-64 rounded-full border-8 border-black flex items-center justify-center bg-white shadow-2xl relative transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
                    {/* Orange Glow/Highlight inside */}
                    <div className="absolute inset-2 rounded-full border-4 border-orange-400 opacity-50 animate-pulse"></div>
                    <span className="text-8xl z-10">🧘</span>
                </div>
            </div>

            {/* Controls & Info */}
            <div className="w-full">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Mountain Pose</h2>
                    <p className="text-orange-500 font-semibold">Hold for 30s • Breathe Deeply</p>
                </div>

                {/* Progress Bar: Orange line over Blue base (Investor Req) */}
                <div className="w-full h-4 bg-blue-200 rounded-full overflow-hidden mb-6 relative">
                    <div 
                        className="h-full bg-orange-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(249,115,22,0.6)]" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-bold text-gray-700">{formatTime(currentTime)}</span>
                    
                    {/* Play/Pause Button */}
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)} 
                        className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl shadow-xl hover:bg-orange-600 hover:scale-105 transition transform"
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    
                    <span className="text-lg font-mono font-bold text-gray-500">{formatTime(activeSession.duration_minutes * 60)}</span>
                </div>
            </div>
          </div>

          {/* Right Column: AI Coach */}
          <div className="w-full lg:w-1/3 h-[500px] lg:h-auto">
            <div className="bg-white rounded-2xl shadow-lg h-full overflow-hidden border border-gray-100">
              <ChatBot 
                isEmbedded={true} 
                persona="yoga" 
                contextualData={{ session: activeSession.title }}
              />
            </div>
          </div>

        </main>
      </div>
    );
  }

  // --- RENDER: LIST VIEW (Default Dashboard View) ---
  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-green-400 to-teal-400 text-white shadow-lg rounded-2xl p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
             <span className="text-4xl">🧘</span>
             <div>
                <h1 className="text-2xl font-bold">Yoga Flows</h1>
                <p className="text-white/80 text-sm">Strength, balance & awareness</p>
             </div>
        </div>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition backdrop-blur-sm">
            ← Dashboard
        </button>
      </header>

      <main className="w-full">
        {content.length === 0 ? YogaEducationalContent : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Flows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition cursor-pointer border border-gray-100 dark:border-gray-700" onClick={() => handleStartSession(item)}>
                  <div className="h-48 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <span className="text-6xl drop-shadow-lg">🧘</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">⏱️ {item.duration_minutes} min</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full font-medium">{item.difficulty_level}</span>
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