// /frontend/src/pages/Recommendations.jsx (FINAL + MULTILINGUAL AI)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// 1. Import Language Utilities
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

// Helper to get an icon for content type
const ContentIcon = ({ type }) => {
  if (type === 'nlp') return <span className="text-2xl">🧠</span>;
  if (type === 'yoga') return <span className="text-2xl">🧘</span>;
  if (type === 'meditation') return <span className="text-2xl">🧘‍♂️</span>;
  return <span className="text-2xl">✨</span>;
};

export default function Recommendations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 2. Initialize Translation Hook
  // We need 'language' here to tell the AI which language to speak
  const { t, language } = useLanguage();

  const [recommendations, setRecommendations] = useState([]);
  const [aiPlan, setAiPlan] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false); 
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Standard Recommendations
        const recResponse = await api.get('/content/recommendations');
        
        if (recResponse.data && recResponse.data.length > 0) {
          setRecommendations(recResponse.data);
          setLoading(false);
        } else {
          // 2. If NO database recommendations, trigger AI Generation
          generateAIPlan();
        }

      } catch (err) {
        console.error('Error fetching recommendations:', err);
        // Fallback to AI if DB fails
        generateAIPlan(); 
      }
    };

    loadData();
  }, []); 

  // --- AI GENERATION LOGIC ---
  const generateAIPlan = async () => {
    setGenerating(true);
    try {
        // A. Fetch Report
        const reportRes = await api.get('/assessment/report');
        const scores = reportRes.data.domain_scores;
        
        // B. Find lowest 3 domains
        const sortedDomains = Object.entries(scores)
            .sort(([, a], [, b]) => a - b) 
            .slice(0, 3) 
            .map(([domain]) => domain);

        if (sortedDomains.length === 0) {
            setLoading(false);
            return; 
        }

        // --- C. DYNAMIC LANGUAGE NAME ---
        const targetLang = language === 'de' ? 'German' : language === 'fr' ? 'French' : 'English';

        // D. Construct Prompt
        const prompt = `
            ACT AS: A Wellness Expert (NLP, Yoga, Meditation).
            CONTEXT: The user has completed an assessment.
            USER STRUGGLES: They scored lowest in: ${sortedDomains.join(', ')}.
            TASK: Create a brief, 3-step "Immediate Action Plan".
            OUTPUT LANGUAGE: ${targetLang} (Strictly respond in this language).
            FORMAT:
            1. NLP Technique: [Name] - [1 sentence instruction]
            2. Yoga Pose: [Name] - [1 sentence instruction]
            3. Meditation: [Name] - [1 sentence instruction]
            Keep it encouraging and short.
        `;

        // E. Call Chatbot Endpoint
        const chatRes = await api.post('/chat', {
            message: prompt,
            persona: 'general',
            context: { source: 'recommendations_page' }
        });

        setAiPlan({
            domains: sortedDomains,
            text: chatRes.data.reply
        });

    } catch (err) {
        console.error("AI Generation failed:", err);
        setError(t('common.errorLoad') || "Could not generate recommendations.");
    } finally {
        setLoading(false);
        setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {generating 
                ? (t('recommendations.generatingAI') || "AI is crafting your personalized plan...") 
                : (t('common.analyzing') || "Analyzing your report...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t('recommendations.title') || "Your Recommendations"}
          </h1>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              ← {t('common.backToDashboard') || "Back to Dashboard"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* CASE 1: DATABASE RECOMMENDATIONS */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {t('recommendations.intro') || "Based on your assessment, here are the top practices we recommend to help you find balance."}
            </p>
            {recommendations.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4 border border-gray-100 dark:border-gray-700"
              >
                <ContentIcon type={item.content_type} />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-orange-600 uppercase">
                    {item.target_domain}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                </div>
                <button
                  onClick={() => navigate(`/content/${item.content_type}`)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  {t('recommendations.startPractice') || "Start Practice"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CASE 2: AI GENERATED PLAN */}
        {recommendations.length === 0 && aiPlan && (
             <div className="space-y-8 animate-fade-in">
                
                {/* AI Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                    <h2 className="text-2xl font-bold mb-2">⚡ {t('recommendations.aiTitle') || "Your Personalized AI Plan"}</h2>
                    <p className="opacity-90">
                        {t('recommendations.aiReason') || "We noticed you could use support in:"} <strong>{aiPlan.domains.join(", ")}</strong>.
                    </p>
                </div>

                {/* The AI Content */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
                        {t('recommendations.actionPlan') || "Suggested Action Plan"}
                    </h3>
                    
                    {/* Render AI Text */}
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                        {aiPlan.text}
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => navigate('/content/nlp')}
                            className="flex-1 py-3 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                        >
                            {t('recommendations.goToNLP') || "Go to NLP Journal"}
                        </button>
                        <button
                            onClick={() => navigate('/content/yoga')}
                            className="flex-1 py-3 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-xl font-semibold hover:bg-green-200 dark:hover:bg-green-800 transition"
                        >
                            {t('recommendations.goToYoga') || "Go to Yoga"}
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* CASE 3: NO DATA AT ALL */}
        {recommendations.length === 0 && !aiPlan && !loading && (
          <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('recommendations.allSet') || "All Set!"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('recommendations.noRecs') || "We couldn't find any specific recommendations, but you can browse our full library."}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              {t('recommendations.browse') || "Browse Content"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}