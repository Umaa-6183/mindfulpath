// src/pages/Admin/Content.js

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/api.js';

export default function AdminContent() {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    content_type: 'meditation',
    title: '',
    description: '',
    instructor: '',
    duration_minutes: '',
    difficulty_level: 'beginner',
  });
  const [file, setFile] = useState(null);
  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (adminUser.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchContent();
  }, [navigate, adminUser.role]);

  const fetchContent = async () => {
    try {
      const response = await api.get('/admin/content');
      setContent(response.data.content || []);
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('content_type', formData.content_type);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('instructor', formData.instructor);
      submitData.append('duration_minutes', parseInt(formData.duration_minutes));
      submitData.append('difficulty_level', formData.difficulty_level);

      if (file) {
        submitData.append('file', file);
      }

      await api.post(`/admin/content/${formData.content_type}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Content uploaded successfully!');
      setFormData({
        content_type: 'meditation',
        title: '',
        description: '',
        instructor: '',
        duration_minutes: '',
        difficulty_level: 'beginner',
      });
      setFile(null);
      setShowForm(false);
      fetchContent();
    } catch (err) {
      console.error('Error uploading content:', err);
      alert('Failed to upload content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await api.delete(`/admin/content/${contentId}`);
        alert('Content deleted successfully!');
        fetchContent();
      } catch (err) {
        console.error('Error deleting content:', err);
        alert('Failed to delete content');
      }
    }
  };

  if (loading && !showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Content Management (CMS)</h1>
            <Link
              to="/admin"
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upload New Content</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-4 py-2 rounded-lg text-white transition ${
                showForm ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {showForm ? '✕ Cancel' : '+ Add Content'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="meditation">Meditation</option>
                  <option value="yoga">Yoga</option>
                  <option value="nlp">NLP</option>
                </select>

                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              ></textarea>

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />

                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />

                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Upload File (Video/Audio)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
              >
                Upload Content
              </button>
            </form>
          )}
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Instructor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Views</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {content.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {c.content_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{c.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{c.instructor || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {c.duration_minutes ? `${c.duration_minutes} min` : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        c.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {c.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{c.view_count}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
