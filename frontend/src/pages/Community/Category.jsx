// src/pages/Community/Category.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api.js';

export default function CommunityCategory() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchThreads();
  }, [categoryId]);

  const fetchThreads = async () => {
    try {
      const response = await api.get(`/community/threads/category/${categoryId}?sort_by=recent`);
      setThreads(response.data);
    } catch (err) {
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      await api.post('/community/threads', {
        category_id: parseInt(categoryId),
        ...formData,
      });
      alert('Thread created successfully!');
      setFormData({ title: '', description: '' });
      setShowCreateForm(false);
      fetchThreads();
    } catch (err) {
      console.error('Error creating thread:', err);
      alert('Failed to create thread');
    }
  };

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
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Category Threads</h1>
          <button
            onClick={() => navigate('/community')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Categories
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Create Thread Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-8 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
        >
          + Start New Thread
        </button>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <form onSubmit={handleCreateThread} className="space-y-4">
              <input
                type="text"
                placeholder="Thread Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                minLength="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              />

              <textarea
                placeholder="Thread Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                minLength="10"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              ></textarea>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                >
                  Create Thread
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Threads List */}
        <div className="space-y-4">
          {threads.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No threads yet. Be the first to start one!</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => navigate(`/community/threads/${thread.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6 border-l-4 border-orange-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800 hover:text-orange-600">
                    {thread.title}
                  </h3>
                  {thread.is_pinned && <span className="text-orange-600 text-sm font-semibold">📌 Pinned</span>}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{thread.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex gap-4">
                    <span>👁️ {thread.view_count} views</span>
                    <span>💬 {thread.reply_count} replies</span>
                  </div>
                  <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
