// /frontend/src/pages/Recommendations.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// Helper to get an icon for content type
const ContentIcon = ({ type }) => {
  if (type === 'nlp') return <span className="text-2xl">🧠</span>;
  if (type === 'yoga') return <span className="text-2xl">🧘</span>;
  if (type === 'meditation') return <span className="text-2xl">🧘‍♂️</span>;
  return null;
};

export default function Recommendations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const response = await api.get('/content/recommendations');
        setRecommendations(response.data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.response?.data?.detail || 'Could not load recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
          <p className="mt-4">Analyzing your report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Your Recommendations</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700 mb-6">
              Based on your assessment, here are the top practices we recommend to help you find balance.
            </p>
            {recommendations.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4"
              >
                <ContentIcon type={item.content_type} />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-orange-600 uppercase">
                    {item.target_domain}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
                <button
                  onClick={() => navigate(`/content/${item.content_type}`)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Start Practice
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-10 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800">All Set!</h2>
            <p className="text-gray-600 mt-2">
              We couldn't find any specific recommendations, but you can browse our full library.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg"
            >
              Browse Content
            </button>
          </div>
        )}
      </main>
    </div>
  );
}