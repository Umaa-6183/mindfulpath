// /frontend/src/pages/Index.jsx

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); 

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
      
      {/* --- Background Yoga Image --- */}
      {/* Position it absolutely to cover the background partially and add a subtle blur/opacity */}
      <img 
        src="/yoga-sunrise.jpg" // Make sure this image is in your /public folder
        alt="Person doing yoga at sunrise" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 sm:opacity-50 blur-sm"
      />
      
      {/* Overlay to ensure text readability over the image */}
      <div className="absolute inset-0 bg-black opacity-20"></div>

      {/* Main Content (centered) */}
      <div className="max-w-xl w-full text-center relative z-10"> {/* z-10 to bring content above background image */}
        
        {/* Logo and Branding */}
        <div className="mb-4">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
            {/* Assuming /logo.png is a clean, single-color version */}
            <img src="/logo.png" alt="MindfulPath" className="w-16 h-16" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight text-orange-200">
          MindfulPath
        </h1>
        <p className="text-xl mb-10 font-medium tracking-wide text-amber-200">
          Integrate NLP, Yoga & Meditation into your daily wellness journey
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center">
          <Link 
            to="/register" 
            className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg shadow-xl hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition duration-300"
          >
            Sign In
          </Link>
        </div>
        
      </div>
    </div>
  );
}