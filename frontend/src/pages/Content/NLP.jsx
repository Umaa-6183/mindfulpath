// /frontend/src/pages/Content/NLP.jsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBot from '../../components/ChatBot.jsx'; // Import the reusable component
import '../../styles/theme.css'; 

export default function NLPContent() {
  const navigate = useNavigate();
  const [journalEntry, setJournalEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState([
    { id: 1, text: "I often feel stuck because I believe 'I am not good enough to succeed'.", date: "2025-11-14" },
    { id: 2, text: "I want to be more confident in my career.", date: "2025-11-13" }
  ]);
  const chatRef = useRef(null); // Ref to access the ChatBot's send function
  
  const handleSave = (e) => {
    e.preventDefault();
    if (journalEntry.trim() === '') return;

    // In a real app, this would save to the database
    const newEntry = {
      id: savedEntries.length + 2,
      text: journalEntry,
      date: new Date().toISOString().split('T')[0]
    };

    setSavedEntries([newEntry, ...savedEntries]);
    setJournalEntry(''); // Clear input
    alert('Entry saved! Check the sidebar for insight.');
  };

  const triggerReframing = (promptType) => {
    // This is how we interact with the embedded chatbot
    let prompt;
    if (promptType === 'identify') {
      prompt = `ANALYZE: Based on my last entry, help me identify the limiting belief (e.g., 'I must be perfect'). Do not analyze my past entries, only the text I'm about to type.`;
    } else if (promptType === 'affirmation') {
      prompt = `GUIDE: Help me transform this desire into a clear, present-tense affirmation for my subconscious mind. Focus on NLP rules.`;
    }
    
    // We would use a global state manager or a direct ref to send the prompt
    // For this demonstration, we'll just log it.
    console.log(`[Action Triggered]: Sending prompt to AI: ${prompt}`);
    alert(`Action: ${promptType.toUpperCase()} triggered. The AI should guide you now.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-400 to-blue-400 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">🧠 NLP Journaling</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Main Content: Journaling Area + AI Sidebar */}
      <main className="max-w-7xl mx-auto py-8 w-full flex flex-grow gap-8 px-4">
        
        {/* Left Column: Guided Text Input (Journal) */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="bg-white rounded-xl shadow-lg p-6 flex-grow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-orange-500 pb-2">
              Guided Journaling
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Write out your thoughts, limiting beliefs, or new affirmations here. Your NLP Assistant will help you refine them.
            </p>
            
            <form onSubmit={handleSave} className="space-y-4 h-full flex flex-col">
              <textarea
                style={{minHeight: '300px'}}
                placeholder="Start writing your thoughts here..."
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                className="flex-grow w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 resize-none"
              ></textarea>
              
              {/* Journal Actions */}
              <div className="flex gap-4">
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
                  Save Entry
                </button>
                {/* This button sends a prompt to the AI chat */}
                <button 
                    type="button"
                    onClick={() => triggerReframing('identify')}
                    className="flex-1 px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
                >
                    Identify Limiting Belief
                </button>
                <button 
                    type="button"
                    onClick={() => triggerReframing('affirmation')}
                    className="flex-1 px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
                >
                    Generate Affirmation
                </button>
              </div>
            </form>
          </div>
          
          {/* Saved Entries */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              Past Entries
            </h2>
            <div className="space-y-4">
              {savedEntries.map((entry) => (
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-300" key={entry.id}>
                  <p className="text-gray-800 mb-2">{entry.text}</p>
                  <p className="text-gray-500 text-sm">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Coach (Embedded Chatbot) */}
        <div className="w-full lg:w-1/3 h-[70vh] lg:h-auto">
          <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden">
            <ChatBot 
              ref={chatRef} // You would use this ref to send the prompt directly
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