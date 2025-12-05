// /frontend/src/pages/Report.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../config/api.js';
import { useTheme } from '../context/ThemeContext.jsx'; 

// 1. Import Language Utilities
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

ChartJS.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function Report() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { isDarkMode } = useTheme(); 
  
  // 2. Initialize Translation Hook
  const { t } = useLanguage();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get('/assessment/report');
        setReport(response.data);
      } catch (err) {
        console.error('Error fetching report:', err);
        // If error, stop loading but let UI handle the empty state or alert
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [navigate]);

  const chartOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 12,
        ticks: {
          stepSize: 3,
          color: isDarkMode ? '#e5e7eb' : '#6b7280', 
          backdropColor: 'transparent',
        },
        grid: {
          color: isDarkMode ? '#4b5563' : '#e5e7eb', 
        },
        angleLines: {
          color: isDarkMode ? '#4b5563' : '#e5e7eb',
        },
        pointLabels: {
          color: isDarkMode ? '#d1d5db' : '#374151', 
        }
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
            color: isDarkMode ? '#ffffff' : '#111827' 
        }
      },
    },
  };
  
  const chartData = {
    labels: report ? Object.keys(report.domain_scores) : [],
    datasets: [
      {
        label: t('report.wellnessScore') || 'Your Wellness Score', // Translated Label
        data: report ? Object.values(report.domain_scores) : [],
        borderColor: '#f97316',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            {t('common.generatingReport') || "Generating your report..."}
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('report.noData') || "No assessment data available"}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            {t('common.goToDashboard') || "Go to Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  // --- LOGIC FOR NEXT LEVEL UNLOCK ---
  const completedLevels = report.completed_levels || [];
  
  // Default: Next step is Level 2
  let nextStep = {
    path: '/upgrade/level2',
    label: t('report.unlockLevel2') || 'Unlock Level 2',
    desc: t('report.level2Desc') || 'Intensive assessment + 30-day roadmap'
  };

  // If Level 2 is done, Next step is Level 3
  if (completedLevels.includes(2)) {
    nextStep = {
      path: '/upgrade/level3',
      label: t('report.unlockLevel3') || 'Unlock Level 3',
      desc: t('report.level3Desc') || 'Expert coaching + Advanced Metrics'
    };
  }

  // If Level 3 is done, Next step is Level 4
  if (completedLevels.includes(3)) {
    nextStep = {
      path: '/upgrade/level4', // Assuming this route exists/will exist
      label: t('report.unlockLevel4') || 'Unlock Level 4',
      desc: t('report.level4Desc') || 'Mastery Level & Lifetime Access'
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Header with Dashboard Redirect */}
      <header className="bg-gradient-to-r from-orange-400 to-blue-400 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {t('report.title') || "Your Wellness Report"}
            </h1>
            <p className="text-sm mt-2 opacity-90">
              {t('report.generatedOn') || "Generated on"} {new Date(report.report_generated_at).toLocaleDateString()}
            </p>
          </div>
          
          {/* 3. Action Area: Language Selector + Dashboard Button */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition backdrop-blur-sm"
            >
              ← {t('common.dashboard') || "Dashboard"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Overall Score Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-orange-500 mb-2">
                {report.overall_score}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                 {t('report.outOf') || "out of"} 144
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('report.overallScoreLabel') || "Overall Life Balance Score"}
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-blue-400 dark:text-blue-300 mb-2">
                {report.overall_stage.stage}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{report.overall_stage.description}</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                {t('report.recommendedFocus') || "Recommended Focus"}
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-200">{report.overall_stage.recommendation}</p>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              {t('report.domainScores') || "Your Domain Scores"}
            </h3>
            <div className="w-full max-w-md mx-auto">
              <Radar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Domain Feedback */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {t('report.domainInsights') || "Domain Insights"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(report.domain_feedback).map(([domain, feedback]) => (
              <div
                key={domain}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-orange-500"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{domain}</h3>
                  <span className="text-2xl font-bold text-orange-500">
                    {feedback.score}/12
                  </span>
                </div>
                <p className="text-sm text-orange-600 font-semibold mb-2">
                  {feedback.label}
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{feedback.feedback}</p>
                
                <div className="bg-blue-50 dark:bg-blue-900 rounded p-3">
                  <p className="text-xs text-gray-600 dark:text-blue-300 font-semibold mb-2">
                    {t('report.recommendedPractices') || "Recommended Practices:"}
                  </p>
                  
                  {Array.isArray(feedback.recommendations) ? (
                    <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-200">
                      {feedback.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-700 dark:text-gray-200">
                      {feedback.recommendations}
                    </p>
                  )}
                  
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Section */}
        {report.badges && report.badges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
               {t('report.achievements') || "Your Achievements"}
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex flex-wrap gap-x-4 gap-y-6 justify-center">
                
                {report.badges.map((badge) => (
                  <div key={badge.id || badge.name} className="text-center w-28 flex flex-col items-center">
                    <div 
                      className="w-20 h-20 p-2 rounded-full border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 flex items-center justify-center shadow-lg shadow-orange-500/60"
                      title={badge.name} 
                    >
                      <span className="text-4xl dark:text-white">{badge.icon || '🏆'}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2 break-words">
                      {badge.name}
                    </p>
                  </div>
                ))}
                
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg shadow-lg p-8 mb-8 transition-colors">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
             {t('report.nextSteps') || "Next Steps"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/recommendations')}
              className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition text-center dark:hover:bg-gray-600"
            >
              <div className="text-2xl mb-2 dark:text-white">🎯</div>
              <p className="font-semibold text-gray-800 dark:text-white">
                {t('report.getRecommendations') || "Get Recommendations"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {t('report.recsDesc') || "Personalized content based on your scores"}
              </p>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition text-center dark:hover:bg-gray-600"
            >
              <div className="text-2xl mb-2 dark:text-white">📚</div>
              <p className="font-semibold text-gray-800 dark:text-white">
                 {t('report.exploreContent') || "Explore Content"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                 {t('report.exploreDesc') || "NLP, Yoga & Meditation resources"}
              </p>
            </button>

            {/* DYNAMIC UPGRADE BUTTON */}
            <button
              onClick={() => navigate(nextStep.path)}
              className="p-4 bg-orange-100 dark:bg-orange-800 rounded-lg shadow hover:shadow-lg transition text-center border-2 border-orange-500"
            >
              <div className="text-2xl mb-2 dark:text-white">🚀</div>
              <p className="font-semibold text-orange-600 dark:text-white">{nextStep.label}</p>
              <p className="text-xs text-orange-700 dark:text-orange-200 mt-2">
                {nextStep.desc}
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}