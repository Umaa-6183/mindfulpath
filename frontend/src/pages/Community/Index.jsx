// src/pages/Community/Index.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';

export default function CommunityIndex() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/community/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-400 to-blue-400 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Community</h1>
          <p className="text-lg opacity-90">Connect, share, and grow together</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/community/category/${category.id}`)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition transform hover:scale-105"
              style={{ borderTop: `4px solid ${category.color || '#f97316'}` }}
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {category.thread_count} threads
                </span>
                <span className="text-orange-600 hover:text-orange-700 font-semibold">→</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
