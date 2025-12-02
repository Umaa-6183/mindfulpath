// /frontend/src/App.jsx (FULLY CORRECTED)

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import PaymentSuccess from './pages/Payment/PaymentSuccess.jsx';
// --- Import ALL your pages (using .jsx) ---
import Index from './pages/Index.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Report from './pages/Report.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ChatBot from './components/ChatBot.jsx';
import ThemeToggle from './components/ThemeToggle.jsx'; // <--- NEW LINE 1: Import the button

// Assessment
import Level1 from './pages/Assessment/Level1.jsx';
import Level2 from './pages/Assessment/Level2.jsx';
import Level3 from './pages/Assessment/Level3.jsx';

// Upgrade
import UpgradeLevel2 from './pages/Upgrade/Level2.jsx';
import UpgradeLevel3 from './pages/Upgrade/Level3.jsx';
import Recommendations from './pages/Recommendations.jsx';
// Content (for Users)
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


// This component protects your user routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading...</p>
      </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}


function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <ThemeToggle /> {/* <--- NEW LINE 2: The Button goes here safely */}
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
        {/* FIX: Redirect /assessment to the Level 1 Assessment component */}
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

        {/* Admin Routes (Uses a different protected route) */}
        <Route path="/admin" element={ <AdminProtectedRoute> <AdminDashboard /> </AdminProtectedRoute> } />
        <Route path="/admin/users" element={ <AdminProtectedRoute> <AdminUsers /> </AdminProtectedRoute> } />
        <Route path="/admin/users/:id" element={ <AdminProtectedRoute> <AdminUserDetails /> </AdminProtectedRoute> } />
        <Route path="/admin/content" element={ <AdminProtectedRoute> <AdminContent /> </AdminProtectedRoute> } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;