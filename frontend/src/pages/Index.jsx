// /frontend/src/pages/Index.jsx

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// 1. Import the Language Context and Component
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); 
  
  // 2. Get the translation helper
  const { t } = useLanguage();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-t from-orange-500 to-blue-700 text-white relative overflow-hidden">
      
      {/* --- Language Selector Positioned Absolute Top-Right --- */}
      {/* This ensures it floats above everything without breaking your centered layout */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* --- Background Yoga Image --- */}
      <img 
        src="/yoga-sunrise.jpg" 
        alt="Person doing yoga at sunrise" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 sm:opacity-50 blur-sm"
      />
      
      {/* Overlay to ensure text readability over the image */}
      <div className="absolute inset-0 bg-black opacity-20"></div>

      {/* Main Content (centered) */}
      <div className="max-w-xl w-full text-center relative z-10">
        
        {/* Logo and Branding */}
        <div className="mb-4">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
            <img src="/logo.png" alt="MindfulPath" className="w-16 h-16" />
          </div>
        </div>

        {/* Title - Keeping Brand Name English, but you can use t('heroTitle') if you prefer */}
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight text-orange-200">
          MindfulPath
        </h1>
        
        {/* 3. Translated Subtitle */}
        <p className="text-xl mb-10 font-medium tracking-wide text-amber-200">
          {t('heroSubtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center">
          <Link 
            to="/register" 
            className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg shadow-xl hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            {/* 4. Translated Button Text */}
            {t('register')}
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition duration-300"
          >
            {/* 5. Translated Button Text */}
            {t('login')}
          </Link>
        </div>
        
      </div>
    </div>
  );
}