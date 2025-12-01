// /frontend/src/pages/Dashboard.jsx (FULLY CORRECTED with Dark Mode)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../config/api.js';
// Removed: import './Dashboard.css'; // No longer needed

// Import Chart.js components
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadarController,
  RadialLinearScale,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadarController,
  RadialLinearScale
);

// Helper component for Stat Cards (Applied Dark Mode classes)
function StatCard({ icon, value, label }) {
  return (
    // bg-white -> dark:bg-gray-800
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center dark:shadow-xl">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-orange-500">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

// Helper component for Practice Navigation Cards (Applied Dark Mode classes)
function NavCard({ icon, title, description, to, color = 'blue' }) {
  const borderColor = color === 'orange' ? 'border-orange-500' : 'border-blue-500';
  return (
    <Link 
      to={to} 
      // bg-white -> dark:bg-gray-800, text-gray-900 -> dark:text-white
      className={`bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col border-l-4 ${borderColor} transition-all hover:shadow-lg dark:hover:bg-gray-700 hover:-translate-y-1`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
    </Link>
  );
}


export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [assessmentProgress, setAssessmentProgress] = useState(null);
  const [gamificationProgress, setGamificationProgress] = useState(null);
  const [report, setReport] = useState(null);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceType, setPracticeType] = useState('meditation');
  const [duration, setDuration] = useState(15);

  const fetchData = useCallback(async () => {
    try {
      const [progressRes, gamifyRes, reportRes, logsRes] = await Promise.all([
        api.get('/assessment/progress'),
        api.get('/gamification/progress'),
        api.get('/assessment/report').catch(e => e.response),
        api.get('/gamification/practice/history?days=7')
      ]);
      
      setAssessmentProgress(progressRes.data);
      setGamificationProgress(gamifyRes.data);
      setDailyLogs(logsRes.data);

      if (reportRes && reportRes.status === 200) {
        setReport(reportRes.data);
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]); // Removed navigate, as it's stable

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogPractice = async () => {
    try {
      await api.post('/gamification/practice/log', {
        practice_type: practiceType,
        duration_minutes: parseInt(duration),
        intensity: 'medium',
      });
      alert('Practice logged successfully!');
      setShowPracticeModal(false);
      await fetchData(); // Refresh all data
    } catch (err) {
      console.error('Error logging practice:', err);
      alert('Failed to log practice');
    }
  };

  // --- Chart Data (Tailwind-friendly) ---
  const chartData = {
    labels: report ? Object.keys(report.domain_scores) : [],
    datasets: [
      {
        label: 'Your Wellness Score',
        data: report ? Object.values(report.domain_scores) : [],
        borderColor: '#f97316', // Orange-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // Blue-500 with 10% opacity
        pointBackgroundColor: '#f97316', // Orange-500
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 12, // Max score per domain
        // NOTE: The color logic for charts is applied in the Report.jsx file via isDarkMode state, but using static defaults here is fine.
        ticks: { stepSize: 3, backdropColor: 'transparent', color: '#4b5563' }, // Gray-600
        grid: { color: '#e5e7eb' }, // Gray-200
        angleLines: { color: '#e5e7eb' }, // Gray-200
        pointLabels: {
          font: { size: 10 },
          color: '#374151' // Gray-700
        }
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#111827' // Gray-900
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    // Base container: Soft White/Light Blue bg -> dark:bg-gray-900
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      
      {/* Header (Spec: Orange -> Blue Gradient) */}
      <header className="bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg rounded-b-2xl mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.first_name || user?.email.split('@')[0]}!</h1>
              <p className="text-sm opacity-90 mt-1">Here is your wellness overview. Ready to continue your journey?</p>
            </div>
            <button
              onClick={logout} 
              className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition shrink-0"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
        {/* --- 1. Quick Stats & Log Practice Button --- */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="🔥" value={gamificationProgress?.current_streak || 0} label="Day Streak" />
            <StatCard icon="🏆" value={gamificationProgress?.badges_earned || 0} label="Badges Earned" />
            <StatCard icon="📊" value={gamificationProgress?.total_sessions || 0} label="Total Sessions" />
            <StatCard icon="⏱️" value={gamificationProgress?.total_minutes || 0} label="Minutes Practiced" />
          </div>
          {/* This button is now correctly positioned below the stats */}
          <div className="text-center mt-6">
            <button
              onClick={() => setShowPracticeModal(true)}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition"
            >
              + Log Practice
            </button>
          </div>
        </div>

        {/* --- 2. Wellness Score Graph & Assessment History --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Wellness Score Graph (Larger) */}
          {/* bg-white -> dark:bg-gray-800 */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Wellness Score Graph</h2>
            {report ? (
              <div className="h-80 md:h-96">
                <Radar data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-600 dark:text-gray-400">Complete your Level 1 Assessment to see your wellness graph.</p>
              </div>
            )}
          </div>

          {/* Assessment History (Smaller) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assessment History</h2>
            <div className="space-y-4">
              
              {/* === Level 1 Assessment === */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Level 1 Assessment</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Baseline Score</p>
                </div>
                {assessmentProgress?.level_1.completed ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 shrink-0">
                    Completed
                  </span>
                ) : (
                  <button
                    onClick={() => navigate('/assessment/level1')}
                    className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition shrink-0"
                  >
                    Start
                  </button>
                )}
              </div>
              
              {/* === Level 2 Assessment === */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Level 2 Assessment</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Deeper Insights</p>
                </div>
                {!assessmentProgress?.level_2.unlocked ? (
                  <button
                    onClick={() => navigate('/upgrade/level2')}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition shrink-0"
                  >
                    Unlock
                  </button>
                ) : assessmentProgress?.level_2.completed ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 shrink-0">
                    Completed
                  </span>
                ) : (
                  <button
                    onClick={() => navigate('/assessment/level2')}
                    className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition shrink-0"
                  >
                    Start
                  </button>
                )}
              </div>
              
              {/* === Level 3 Assessment === */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Level 3 Assessment</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">30-Day Roadmap</p>
                </div>
                {!assessmentProgress?.level_3.unlocked ? (
                  <button
                    onClick={() => navigate('/upgrade/level3')}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition shrink-0"
                  >
                    Unlock
                  </button>
                ) : assessmentProgress?.level_3.completed ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 shrink-0">
                    Completed
                  </span>
                ) : (
                  <button
                    onClick={() => navigate('/assessment/level3')}
                    className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition shrink-0"
                  >
                    Start
                  </button>
                )}
              </div>
              
            </div>
            
            <button 
              onClick={() => navigate('/report')} 
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition"
              disabled={!report} // Disable if no report
            >
              View Full Report
            </button>
          </div>
        </div>

        {/* --- 3. Navigation Cards & Daily Log --- */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Start Your Practice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <NavCard 
              icon="🧠" 
              title="NLP Journaling" 
              description="Transform your thoughts and beliefs." 
              to="/content/nlp" 
              color="orange"
            />
            <NavCard 
              icon="🧘" 
              title="Yoga Flows" 
              description="Connect your mind and body." 
              to="/content/yoga"
              color="blue"
            />
            <NavCard 
              icon="🧘‍♂️" 
              title="Meditation" 
              description="Find your inner calm and focus." 
              to="/content/meditation"
              color="blue"
            />

            {/* Daily Log Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-orange-500">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Log (Last 7 Days)</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {dailyLogs.length > 0 ? (
                  dailyLogs.map(log => (
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0" key={log.id}>
                      <div className="text-2xl">
                        {log.practice_type === 'nlp' ? '🧠' : log.practice_type === 'yoga' ? '🧘' : '🧘‍♂️'}
                      </div>
                      <div className="flex-grow">
                        <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 capitalize">{log.practice_type}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{log.duration_minutes} min</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 self-start">
                        {new Date(log.logged_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">You haven't logged any practices yet. Start a session!</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
      </main>

      {/* Log Practice Modal (Now styled with Tailwind) */}
      {showPracticeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Log Your Practice</h2>
  
              <div className="space-y-5">
                <div>
                  <label htmlFor="practiceType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Practice Type</label>
                  <select
                    id="practiceType"
                    value={practiceType}
                    onChange={(e) => setPracticeType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="meditation">Meditation</option>
                    <option value="yoga">Yoga</option>
                    <option value="nlp">NLP Journaling</option>
                  </select>
                </div>
  
                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                  <input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    max="600"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
  
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPracticeModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogPractice}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
                  >
                    Log Practice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}