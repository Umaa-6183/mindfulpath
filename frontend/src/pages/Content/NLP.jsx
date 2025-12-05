// /frontend/src/pages/Content/NLP.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBot from '../../components/ChatBot.jsx'; 
import api from '../../config/api.js'; 
import '../../styles/theme.css'; 

// 1. Import Language Utilities
import { useLanguage } from '../../context/LanguageContext';

export default function NLPContent() {
  const navigate = useNavigate();
  
  // 2. Initialize Translation Hook
  const { t } = useLanguage();
  
  const [journalEntry, setJournalEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState([]); 
  const [loading, setLoading] = useState(true);
  const chatRef = useRef(null); 
  
  // 1. Fetch Practice History (NLP Logs) when page loads
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await api.get('/gamification/practice/history?days=30');
        const nlpLogs = response.data.filter(log => log.practice_type === 'nlp');
        setSavedEntries(nlpLogs);
      } catch (err) {
        console.error("Failed to load entries", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  // 2. Save to Backend Database
  const handleSave = async (e) => {
    e.preventDefault();
    if (journalEntry.trim() === '') return;

    try {
      const response = await api.post('/gamification/practice/log', {
        practice_type: 'nlp',
        duration_minutes: 5, 
        intensity: 'medium',
        notes: journalEntry 
      });

      setSavedEntries([response.data, ...savedEntries]);
      setJournalEntry(''); 
      alert(t('nlp.entrySaved') || 'Entry saved to your permanent journal!');
    } catch (err) {
      console.error(err);
      alert(t('common.errorSave') || 'Failed to save entry. Please try again.');
    }
  };

  const triggerReframing = (promptType) => {
    let prompt;
    if (promptType === 'identify') {
      prompt = `ANALYZE: Based on my last entry, help me identify the limiting belief. Entry: "${journalEntry}"`;
    } else if (promptType === 'affirmation') {
      prompt = `GUIDE: Create a positive affirmation based on this thought: "${journalEntry}"`;
    }
    
    if (chatRef.current) {
        chatRef.current.sendMessage(prompt);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)]">
      
      {/* Header - Card Style */}
      <header className="bg-gradient-to-r from-orange-400 to-blue-400 text-white shadow-lg rounded-2xl p-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
            <span className="text-4xl">🧠</span>
            <div>
                <h1 className="text-2xl font-bold">{t('dashboard.nlpTitle') || "NLP Journaling"}</h1>
                <p className="text-white/80 text-sm">{t('nlp.headerSub') || "Reframe your limiting beliefs"}</p>
            </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition backdrop-blur-sm"
        >
          ← {t('common.dashboard') || "Dashboard"}
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
        
        {/* Left Column: Journaling */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6 h-full overflow-y-auto pr-2">
          
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex-shrink-0 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-orange-500 pb-2">
              {t('nlp.guidedJournaling') || "Guided Journaling"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t('nlp.instruction') || "Write out your thoughts, limiting beliefs, or new affirmations here. Your NLP Assistant will help you refine them."}
            </p>
            
            <form onSubmit={handleSave} className="space-y-4">
              <textarea
                style={{minHeight: '150px'}}
                placeholder={t('nlp.placeholder') || "Start writing your thoughts here..."}
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 bg-white dark:bg-gray-900 text-black dark:text-white resize-none transition-colors"
              ></textarea>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* SAVE BUTTON */}
                <button type="submit" className="flex-1 px-4 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition shadow-md">
                  {t('common.saveEntry') || "Save Entry"}
                </button>
                
                {/* ACTION BUTTONS */}
                <button 
                    type="button"
                    onClick={() => triggerReframing('identify')}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md"
                >
                    {t('nlp.identifyBelief') || "Identify Belief"}
                </button>
                <button 
                    type="button"
                    onClick={() => triggerReframing('affirmation')}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md"
                >
                    {t('nlp.genAffirmation') || "Generate Affirmation"}
                </button>
              </div>
            </form>
          </div>
          
          {/* Saved Entries List */}
          <div className="pb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-2">
              {t('nlp.pastEntries') || "Past Entries"}
            </h2>
            
            {loading ? (
                <div className="text-center text-gray-500">{t('common.loading') || "Loading history..."}</div>
            ) : (
                <div className="space-y-4">
                {savedEntries.length === 0 && (
                    <p className="text-gray-500 italic px-4">
                        {t('nlp.noEntries') || "No entries yet. Write something above!"}
                    </p>
                )}
                
                {savedEntries.map((entry) => (
                    <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-orange-400 dark:border-orange-500 transition-colors">
                    <p className="text-gray-900 dark:text-gray-100 mb-2 font-medium whitespace-pre-wrap">{entry.notes || t('common.noContent')}</p>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">
                        {new Date(entry.logged_date || entry.created_at).toLocaleDateString()}
                    </p>
                    </div>
                ))}
                </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Coach */}
        <div className="w-full lg:w-1/3 h-[600px] lg:h-auto lg:min-h-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full overflow-hidden transition-colors">
            <ChatBot 
              ref={chatRef} 
              isEmbedded={true} 
              persona="nlp" 
              contextualData={{active_field: 'journal'}}
            />
          </div>
        </div>
      </main>
    </div>
  );
}