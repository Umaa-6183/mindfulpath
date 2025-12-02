// /frontend/src/pages/Content/NLP.jsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBot from '../../components/ChatBot.jsx'; 
import '../../styles/theme.css'; 

export default function NLPContent() {
  const navigate = useNavigate();
  const [journalEntry, setJournalEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState([
    { id: 1, text: "I often feel stuck because I believe 'I am not good enough to succeed'.", date: "2025-11-14" },
    { id: 2, text: "I want to be more confident in my career.", date: "2025-11-13" }
  ]);
  const chatRef = useRef(null); 
  
  const handleSave = (e) => {
    e.preventDefault();
    if (journalEntry.trim() === '') return;

    const newEntry = {
      id: savedEntries.length + 2,
      text: journalEntry,
      date: new Date().toISOString().split('T')[0]
    };

    setSavedEntries([newEntry, ...savedEntries]);
    setJournalEntry(''); 
    alert('Entry saved! Check the sidebar for insight.');
  };

  const triggerReframing = (promptType) => {
    let prompt;
    if (promptType === 'identify') {
      prompt = `ANALYZE: Based on my last entry, help me identify the limiting belief (e.g., 'I must be perfect'). Do not analyze my past entries, only the text I'm about to type.`;
    } else if (promptType === 'affirmation') {
      prompt = `GUIDE: Help me transform this desire into a clear, present-tense affirmation for my subconscious mind. Focus on NLP rules.`;
    }
    console.log(`[Action Triggered]: Sending prompt to AI: ${prompt}`);
    alert(`Action: ${promptType.toUpperCase()} triggered. The AI should guide you now.`);
  };

  return (
    // LAYOUT PRESERVED: Flex column, gap-6, handled by App.jsx wrapper
    <div className="flex flex-col gap-6">
      
      {/* Header - Card Style */}
      <header className="bg-gradient-to-r from-orange-400 to-blue-400 text-white shadow-lg rounded-2xl p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <span className="text-4xl">🧠</span>
            <div>
                <h1 className="text-2xl font-bold">NLP Journaling</h1>
                <p className="text-white/80 text-sm">Reframe your limiting beliefs</p>
            </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition backdrop-blur-sm"
        >
          ← Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Journaling (UPDATED TO MATCH YOUR THEME) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Input Section - White Background for Maximum Readability */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex-grow transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-orange-500 pb-2">
              Guided Journaling
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Write out your thoughts, limiting beliefs, or new affirmations here. Your NLP Assistant will help you refine them.
            </p>
            
            <form onSubmit={handleSave} className="space-y-4 h-full flex flex-col">
              {/* INPUT AREA: Enforced White Background (Light Mode) and Black Text for Readability */}
              <textarea
                style={{minHeight: '250px'}}
                placeholder="Start writing your thoughts here..."
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                className="flex-grow w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 bg-white dark:bg-gray-900 text-black dark:text-white resize-none transition-colors"
              ></textarea>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* SAVE BUTTON: ORANGE (Matches 'Orange send button' request) */}
                <button type="submit" className="flex-1 px-4 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition shadow-md">
                  Save Entry
                </button>
                
                {/* ACTION BUTTONS: BLUE (Matches 'User: Blue bubble' theme) */}
                <button 
                    type="button"
                    onClick={() => triggerReframing('identify')}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md"
                >
                    Identify Belief
                </button>
                <button 
                    type="button"
                    onClick={() => triggerReframing('affirmation')}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md"
                >
                    Generate Affirmation
                </button>
              </div>
            </form>
          </div>
          
          {/* Saved Entries */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-2">
              Past Entries
            </h2>
            <div className="space-y-4">
              {savedEntries.map((entry) => (
                <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-orange-400 dark:border-orange-500 transition-colors">
                  <p className="text-gray-900 dark:text-gray-100 mb-2 font-medium">{entry.text}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">{entry.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Coach (Container) */}
        <div className="w-full lg:w-1/3 h-[600px] lg:h-auto sticky top-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full overflow-hidden transition-colors">
            {/* The ChatBot component handles the bubbles internally */}
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