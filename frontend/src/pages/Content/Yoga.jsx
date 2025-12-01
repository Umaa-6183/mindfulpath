// /frontend/src/pages/Content/Yoga.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import ChatBot from '../../components/ChatBot.jsx'; // <--- IMPORT ADDED

// ... (Keep existing YogaEducationalContent component as is) ...
const YogaEducationalContent = (
  <div className="space-y-10">
    {/* Overview Card */}
    <div className="bg-white rounded-xl shadow-2xl p-8 border-t-4 border-teal-500">
      <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="text-teal-500 mr-3">✨</span>
        The Transformative Power of Yoga
      </h2>
      <p className="text-lg text-gray-700 leading-relaxed">
        Yoga is an ancient discipline that brings together physical postures (<b>asanas</b>), breathing techniques (<b>pranayama</b>), and meditation. It fosters harmony between body, mind, and spirit.
      </p>
    </div>
    <div className="bg-green-50 rounded-xl p-6 shadow">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🔑 Starting Your Yoga Flow</h3>
      <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
        <li><b>Focus on the Breath:</b> Let your breath guide your movement.</li>
        <li><b>Find Your Edge:</b> Move into a stretch until you feel comfortable tension.</li>
      </ul>
    </div>
  </div>
);

export default function YogaContent() {
  const navigate = useNavigate();
  // ... (Keep existing state: content, loading, activeSession, isPlaying, currentTime, progress) ...
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  // ... (Keep existing useEffects and handlers: fetchContent, timer logic, formatTime, start/close session) ...
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/content/media/by-type/yoga');
        setContent(response.data.content || []);
      } catch (err) {
        console.error('Error fetching Yoga content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
      </div>
    );
  }

  // --- RENDER: PLAYER VIEW (Active Session) ---
  if (activeSession) {
    return (
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
            className="text-gray-500 hover:text-orange-600 font-medium transition"
          >
            ✕ Close
          </button>
        </header>

        {/* Main Content: Split Screen Layout */}
        <main className="flex-grow flex flex-col lg:flex-row p-6 gap-6 max-w-7xl mx-auto w-full">
          
          {/* Left Column: Player Visuals & Controls */}
          <div className="w-full lg:w-2/3 flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-8">
            
            {/* Visual Placeholder */}
            <div className="w-full max-w-lg aspect-video bg-white rounded-3xl border-4 border-black shadow-2xl flex items-center justify-center relative overflow-hidden mb-8">
              <div className="text-center">
                <div className={`w-32 h-32 rounded-full bg-orange-100 border-4 border-orange-500 flex items-center justify-center mb-4 mx-auto transition-all duration-1000 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
                   <span className="text-6xl">🧘</span>
                </div>
                <p className="text-xl font-bold text-gray-900">Follow the Flow</p>
                <p className="text-orange-600 font-medium mt-1">Breathe Deeply</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 mb-8">
               <button className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200" onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}>⏪ 10s</button>
               <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-4xl shadow-lg hover:bg-orange-600 hover:scale-105 transition transform">
                 {isPlaying ? '⏸' : '▶'}
               </button>
               <button className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200" onClick={() => setCurrentTime(Math.min(activeSession.duration_minutes * 60, currentTime + 10))}>10s ⏩</button>
            </div>

            {/* Timer Bar (Orange/Blue) */}
            <div className="w-full max-w-2xl mt-auto">
              <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(activeSession.duration_minutes * 60)}</span>
              </div>
              <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Coach */}
          <div className="w-full lg:w-1/3 h-[500px] lg:h-auto">
            <div className="bg-white rounded-2xl shadow-lg h-full overflow-hidden border border-gray-100">
              {/* <--- AI INTEGRATION HERE ---> */}
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

  // --- RENDER: LIST VIEW (Default) ---
  // (Keep the existing List View return block exactly as it was)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... Header & List Content ... */}
      <header className="bg-gradient-to-r from-green-400 to-teal-400 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button onClick={() => navigate('/dashboard')} className="mb-4 text-white hover:text-gray-200 font-semibold">← Back to Dashboard</button>
          <h1 className="text-4xl font-bold mb-2">🧘 Yoga Flows</h1>
          <p className="text-lg opacity-90">Body-centered practices for strength, balance & awareness</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {content.length === 0 ? YogaEducationalContent : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Flows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer" onClick={() => handleStartSession(item)}>
                  <div className="h-48 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"><span className="text-6xl">🧘</span></div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>⏱️ {item.duration_minutes} min</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{item.difficulty_level}</span>
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