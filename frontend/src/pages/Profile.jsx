// /frontend/src/pages/Profile.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx'; // <--- ADD THIS IMPORT
import api from '../config/api.js';

// --- Reusable Section Header Component ---
// Meets the spec: "Bold Black text with thin Orange underline" [cite: 110]
function SectionHeader({ title }) {
  // Use dark:text-white for text and dark:bg-gray-700 for the body background
  return (
    <div className="pb-2 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="h-0.5 bg-orange-500 w-16 mt-1"></div>
    </div>
  );
}

// --- Reusable Toggle Switch Component ---
// Meets the spec: "Active -> Orange" [cite: 107], "Inactive -> Blue" [cite: 109]
function ToggleSwitch({ label, enabled, setEnabled }) {
  // Toggle logic uses Tailwind classes to match investor spec
  return (
    <label className="flex items-center justify-between cursor-pointer" onClick={setEnabled}>
      <span className="text-lg text-gray-700 dark:text-gray-300">{label}</span>
      <div
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
          enabled ? 'bg-orange-500' : 'bg-blue-500' // Active -> Orange, Inactive -> Blue
        }`}
      >
        <span
          className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
          style={{ top: '2px' }}
        />
      </div>
    </label>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  // --- FIX: Get global dark mode state and toggle function ---
  const { isDarkMode, toggleTheme } = useTheme(); 
  
  // States from your original file
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // useEffect logic from your original file
  useEffect(() => {
    if (!authLoading) {
      const fetchData = async () => {
        if (!user) {
          navigate('/login');
          return;
        }
        try {
          const [historyRes, badgesRes] = await Promise.all([
             api.get('/assessment/history'),
             api.get('/gamification/badges')
          ]);
          
          setAssessmentHistory(historyRes.data);
          setBadges(badgesRes.data);
          
        } catch (err) {
          console.error('Error fetching data:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [navigate, user, authLoading]);

  // Helper function from your file
  const isLevelComplete = (level) => {
    return assessmentHistory.some(a => a.level === level);
  };
  
  // Local states for preferences that the user can edit
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [practiceReminders, setPracticeReminders] = useState(true);

  const handleSaveChanges = () => {
    // Logic to save all preferences
    console.log({
      darkMode: isDarkMode,
      emailNotifications,
      practiceReminders,
    });
    alert('Preferences saved!');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile & Settings
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content - Rebuilt with Tailwind Grid */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left Column (Span 2) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Account Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <SectionHeader title="Account Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
                  <input type="text" value={user.first_name || 'Not set'} readOnly className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <input type="email" value={user.email} readOnly className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</label>
                  <input type="text" value={new Date(user.created_at).toLocaleDateString()} readOnly className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                </div>
              </div>
            </div>

            {/* NEW: Preferences Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <SectionHeader title="Preferences" />
              <div className="space-y-6">
                
                {/* Dark Mode Toggle */}
                <ToggleSwitch
                  label="Dark Mode"
                  enabled={isDarkMode} // Use global state
                  setEnabled={toggleTheme} // Use global toggle function
                />
                
                {/* Other Toggles */}
                <ToggleSwitch
                  label="Email Notifications"
                  enabled={emailNotifications}
                  setEnabled={setEmailNotifications}
                />
                <ToggleSwitch
                  label="Practice Reminders"
                  enabled={practiceReminders}
                  setEnabled={setPracticeReminders}
                />
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleSaveChanges}
                  className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition"
                >
                  Save Preferences
                </button>
              </div>
            </div>

            {/* My Badges Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <SectionHeader title="My Badges" />
              {badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {badges.map((userBadge) => (
                    <div className="text-center flex flex-col items-center" key={userBadge.badge.id}>
                      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl mb-2 shadow-inner">
                        {userBadge.badge.icon_url ? (
                          <img src={userBadge.badge.icon_url} alt={userBadge.badge.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="dark:text-white">🏆</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{userBadge.badge.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Earned {new Date(userBadge.earned_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">You haven't earned any badges yet. Keep practicing!</p>
              )}
            </div>
            
          </div>
          
          {/* --- Right Column (Span 1) --- */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <SectionHeader title="Assessment Status" />
              <div className="space-y-4">
                
                <div className="flex items-center justify-between py-3">
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Level 1</p>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${isLevelComplete(1) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'}`}>
                    {isLevelComplete(1) ? 'Completed' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Level 2</p>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${isLevelComplete(2) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {isLevelComplete(2) ? 'Completed' : 'Locked'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Level 3</p>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${isLevelComplete(3) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {isLevelComplete(3) ? 'Completed' : 'Locked'}
                  </span>
                </div>
                
                <button 
                  onClick={() => navigate('/report')} 
                  className="w-full mt-6 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition"
                  disabled={!isLevelComplete(1)}
                >
                  View Full Report
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}