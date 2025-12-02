// /frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useTheme } from './context/ThemeContext.jsx'; // <--- IMPORT HOOK
import PaymentSuccess from './pages/Payment/PaymentSuccess.jsx';

// --- Import ALL your pages ---
import Index from './pages/Index.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Report from './pages/Report.jsx';
import ChatBot from './components/ChatBot.jsx';

// Assessment
import Level1 from './pages/Assessment/Level1.jsx';
import Level2 from './pages/Assessment/Level2.jsx';
import Level3 from './pages/Assessment/Level3.jsx';

// Upgrade
import UpgradeLevel2 from './pages/Upgrade/Level2.jsx';
import UpgradeLevel3 from './pages/Upgrade/Level3.jsx';
import Recommendations from './pages/Recommendations.jsx';

// Content
import NlpContent from './pages/Content/NLP.jsx';
import YogaContent from './pages/Content/Yoga.jsx';
import MeditationContent from './pages/Content/Meditation.jsx';

// Community
import CommunityIndex from './pages/Community/Index.jsx';
import CommunityCategory from './pages/Community/Category.jsx';
import CommunityThread from './pages/Community/Thread.jsx';

// Admin
import AdminProtectedRoute from './pages/Admin/ProtectedRoute.jsx';
import AdminDashboard from './pages/Admin/Index.jsx';
import AdminUsers from './pages/Admin/Users.jsx';
import AdminUserDetails from './pages/Admin/UserDetails.jsx';
import AdminContent from './pages/Admin/Content.jsx';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  // 1. USE THE HOOK
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <AuthProvider>
      {/* 2. THEME TOGGLE BUTTON (Floating Top Right) */}
      <button 
        onClick={toggleTheme} 
        className="fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 text-2xl hover:scale-110 border border-gray-200 dark:border-gray-700"
        title="Toggle Light/Dark Mode"
      >
        {isDarkMode ? '🌞' : '🌙'}
      </button>

      {/* 3. GLOBAL BACKGROUND WRAPPER (Controls page color) */}
      <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        
        <ChatBot isEmbedded={false} persona="general" />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />
          <Route path="/profile" element={ <ProtectedRoute> <Profile /> </ProtectedRoute> } />
          <Route path="/report" element={ <ProtectedRoute> <Report /> </ProtectedRoute> } />
          
          {/* Assessment Routes */}
          <Route path="/assessment" element={<ProtectedRoute> <Navigate to="/assessment/level1" replace /> </ProtectedRoute>} />
          <Route path="/assessment/level1" element={ <ProtectedRoute> <Level1 /> </ProtectedRoute> } />
          <Route path="/assessment/level2" element={ <ProtectedRoute> <Level2 /> </ProtectedRoute> } />
          <Route path="/assessment/level3" element={ <ProtectedRoute> <Level3 /> </ProtectedRoute> } />
          
          <Route path="/payment/success" element={ <ProtectedRoute> <PaymentSuccess /> </ProtectedRoute> } />
          
          {/* Upgrade Routes */}
          <Route path="/upgrade/level2" element={ <ProtectedRoute> <UpgradeLevel2 /> </ProtectedRoute> } />
          <Route path="/upgrade/level3" element={ <ProtectedRoute> <UpgradeLevel3 /> </ProtectedRoute> } />
          <Route path="/recommendations" element={ <ProtectedRoute> <Recommendations /> </ProtectedRoute> } />
          
          {/* Content Routes */}
          <Route path="/content/nlp" element={ <ProtectedRoute> <NlpContent /> </ProtectedRoute> } />
          <Route path="/content/yoga" element={ <ProtectedRoute> <YogaContent /> </ProtectedRoute> } />
          <Route path="/content/meditation" element={ <ProtectedRoute> <MeditationContent /> </ProtectedRoute> } />

          {/* Community Routes */}
          <Route path="/community" element={ <ProtectedRoute> <CommunityIndex /> </ProtectedRoute> } />
          <Route path="/community/category/:categoryId" element={ <ProtectedRoute> <CommunityCategory /> </ProtectedRoute> } />
          <Route path="/community/threads/:threadId" element={ <ProtectedRoute> <CommunityThread /> </ProtectedRoute> } />

          {/* Admin Routes */}
          <Route path="/admin" element={ <AdminProtectedRoute> <AdminDashboard /> </AdminProtectedRoute> } />
          <Route path="/admin/users" element={ <AdminProtectedRoute> <AdminUsers /> </AdminProtectedRoute> } />
          <Route path="/admin/users/:id" element={ <AdminProtectedRoute> <AdminUserDetails /> </AdminProtectedRoute> } />
          <Route path="/admin/content" element={ <AdminProtectedRoute> <AdminContent /> </AdminProtectedRoute> } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;