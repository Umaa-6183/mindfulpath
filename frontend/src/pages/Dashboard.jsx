// /frontend/src/pages/Dashboard.jsx (SMART START UPDATE)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../config/api.js';

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

// Helper component for Stat Cards
function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center dark:shadow-xl">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-orange-500">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

// Helper component for Practice Navigation Cards
function NavCard({ icon, title, description, to, color = 'blue' }) {
  const borderColor = color === 'orange' ? 'border-orange-500' : 'border-blue-500';
  return (
    <Link 
      to={to} 
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
  
  // Modals State
  const [showManualLogModal, setShowManualLogModal] = useState(false); // Old modal
  const [showActivityModal, setShowActivityModal] = useState(false);   // New "Smart" modal
  
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
  }, [logout]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- NEW: Smart Start Logic ---
  const handleSmartStart = () => {
    // Condition 1: Check if Level 1 is completed
    // We check assessmentProgress.level_1.completed (assuming API structure)
    // Or we check if 'report' exists (since report is generated after Level 1)
    const isLevel1Done = report !== null || assessmentProgress?.level_1?.completed;

    if (!isLevel1Done) {
        // Condition 1: Not Done -> Alert & Redirect
        const confirm = window.confirm("🔒 Please complete your Level 1 Assessment to unlock your personalized practice tools.\n\nGo to Assessment now?");
        if (confirm) {
            navigate('/assessment/level1');
        }
    } else {
        // Condition 2: Done -> Show Activity Selection
        setShowActivityModal(true);
    }
  };

  // Old manual log logic (Preserved)
  const handleLogPractice = async () => {
    try {
      await api.post('/gamification/practice/log', {
        practice_type: practiceType,
        duration_minutes: parseInt(duration),
        intensity: 'medium',
      });
      alert('Practice logged successfully!');
      setShowManualLogModal(false);
      await fetchData(); 
    } catch (err) {
      console.error('Error logging practice:', err);
      alert('Failed to log practice');
    }
  };

  // --- Chart Data ---
  const chartData = {
    labels: report ? Object.keys(report.domain_scores) : [],
    datasets: [
      {
        label: 'Your Wellness Score',
        data: report ? Object.values(report.domain_scores) : [],
        borderColor: '#f97316', 
        backgroundColor: 'rgba(59, 130, 246, 0.1)', 
        pointBackgroundColor: '#f97316', 
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
        max: 12, 
        ticks: { stepSize: 3, backdropColor: 'transparent', color: '#4b5563' }, 
        grid: { color: '#e5e7eb' }, 
        angleLines: { color: '#e5e7eb' }, 
        pointLabels: {
          font: { size: 10 },
          color: '#374151' 
        }
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#111827' 
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      
      {/* Header */}
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
      
        {/* --- 1. Quick Stats & Smart Start Button --- */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="🔥" value={gamificationProgress?.current_streak || 0} label="Day Streak" />
            <StatCard icon="🏆" value={gamificationProgress?.badges_earned || 0} label="Badges Earned" />
            <StatCard icon="📊" value={gamificationProgress?.total_sessions || 0} label="Total Sessions" />
            <StatCard icon="⏱️" value={gamificationProgress?.total_minutes || 0} label="Minutes Practiced" />
          </div>
          
          {/* SMART START BUTTON */}
          <div className="text-center mt-8 flex flex-col items-center">
            <button
              onClick={handleSmartStart}
              className="px-8 py-4 bg-orange-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-orange-600 hover:scale-105 transition transform flex items-center gap-2"
            >
              <span>▶️</span> Start Your Practice
            </button>
            
            {/* Optional Manual Log Link */}
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Practiced offline? 
                <button 
                    onClick={() => setShowManualLogModal(true)}
                    className="ml-1 text-blue-600 hover:underline font-semibold"
                >
                    Log manually here
                </button>
            </p>
          </div>
        </div>

        {/* --- 2. Wellness Score Graph & Assessment History --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Wellness Score Graph */}
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

          {/* Assessment History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assessment History</h2>
            <div className="space-y-4">
              
              {/* Level 1 */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Level 1 Assessment</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Baseline Score</p>
                </div>
                {assessmentProgress?.level_1.completed ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 shrink-0">Completed</span>
                ) : (
                  <button onClick={() => navigate('/assessment/level1')} className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition shrink-0">Start</button>
                )}
              </div>
              
              {/* Level 2 */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Level 2 Assessment</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Deeper Insights</p>
                </div>
                {!assessmentProgress?.level_2.unlocked ? (
                  <button onClick={() => navigate('/upgrade/level2')} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition shrink-0">Unlock</button>
                ) : assessmentProgress?.level_2.completed ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 shrink-0">Completed</span>
                ) : (
                  <button onClick={() => navigate('/assessment/level2')} className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition shrink-0">Start</button>
                )}
              </div>
              
              {/* Level 3 */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Level 3 Assessment</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">30-Day Roadmap</p>
                </div>
                {!assessmentProgress?.level_3.unlocked ? (
                  <button onClick={() => navigate('/upgrade/level3')} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition shrink-0">Unlock</button>
                ) : assessmentProgress?.level_3.completed ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 shrink-0">Completed</span>
                ) : (
                  <button onClick={() => navigate('/assessment/level3')} className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition shrink-0">Start</button>
                )}
              </div>
              
            </div>
            <button onClick={() => navigate('/report')} className="w-full mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition" disabled={!report}>View Full Report</button>
          </div>
        </div>

        {/* --- 3. Navigation Cards & Daily Log --- */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Practice Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <NavCard icon="🧠" title="NLP Journaling" description="Transform your thoughts." to="/content/nlp" color="orange" />
            <NavCard icon="🧘" title="Yoga Flows" description="Connect mind and body." to="/content/yoga" color="blue" />
            <NavCard icon="🧘‍♂️" title="Meditation" description="Find inner calm." to="/content/meditation" color="blue" />

            {/* Daily Log Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-orange-500">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Logs</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {dailyLogs.length > 0 ? (
                  dailyLogs.map(log => (
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0" key={log.id}>
                      <div className="text-2xl">{log.practice_type === 'nlp' ? '🧠' : log.practice_type === 'yoga' ? '🧘' : '🧘‍♂️'}</div>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">No recent logs. Start a session above!</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
      </main>

      {/* --- NEW MODAL: CHOOSE ACTIVITY (Smart) --- */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
                <button 
                    onClick={() => setShowActivityModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl"
                >✕</button>
                
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    What would you like to practice?
                </h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                    Choose a session to start now.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => navigate('/content/meditation')} className="flex items-center p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 dark:border-gray-700 dark:hover:bg-gray-700 transition group text-left">
                        <span className="text-4xl mr-4">🧘‍♂️</span>
                        <div><h3 className="font-bold text-gray-900 dark:text-white">Meditation</h3><p className="text-sm text-gray-500 dark:text-gray-300">Calm & Focus</p></div>
                    </button>

                    <button onClick={() => navigate('/content/yoga')} className="flex items-center p-4 rounded-xl border-2 border-green-100 hover:border-green-500 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-gray-700 transition group text-left">
                        <span className="text-4xl mr-4">🧘</span>
                        <div><h3 className="font-bold text-gray-900 dark:text-white">Yoga Flows</h3><p className="text-sm text-gray-500 dark:text-gray-300">Movement & Breath</p></div>
                    </button>

                    <button onClick={() => navigate('/content/nlp')} className="flex items-center p-4 rounded-xl border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700 transition group text-left">
                        <span className="text-4xl mr-4">🧠</span>
                        <div><h3 className="font-bold text-gray-900 dark:text-white">NLP Journaling</h3><p className="text-sm text-gray-500 dark:text-gray-300">Reframe Thoughts</p></div>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- OLD MODAL: MANUAL LOG (Hidden unless clicked) --- */}
      {showManualLogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Log Offline Practice</h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="practiceType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Practice Type</label>
                  <select id="practiceType" value={practiceType} onChange={(e) => setPracticeType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="meditation">Meditation</option>
                    <option value="yoga">Yoga</option>
                    <option value="nlp">NLP Journaling</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                  <input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min="1" max="600" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowManualLogModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
                  <button onClick={handleLogPractice} className="flex-1 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition">Log Entry</button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}