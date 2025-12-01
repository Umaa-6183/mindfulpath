// src/pages/Admin/Index.js

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/api.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const [userAnalytics, paymentAnalytics, contentAnalytics] = await Promise.all([
          api.get('/admin/analytics/users?days=30'),
          api.get('/admin/analytics/payments?days=30'),
          api.get('/admin/analytics/content'),
        ]);

        setAnalytics({
          users: userAnalytics.data,
          payments: paymentAnalytics.data,
          content: contentAnalytics.data,
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate, user.role]);

  if (!user.role || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Unauthorized access</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
          <p className="mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="flex">
        <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
          <nav className="space-y-2">
            <Link
              to="/admin"
              className="block px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              📊 Dashboard
            </Link>
            <Link
              to="/admin/users"
              className="block px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              👥 Users
            </Link>
            <Link
              to="/admin/content"
              className="block px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              📚 Content Management
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Users Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Active Users (30 days)</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics?.users?.active_users || 0}
                  </p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>

            {/* New Users Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">New Users (30 days)</p>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics?.users?.new_users || 0}
                  </p>
                </div>
                <div className="text-3xl">✨</div>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-orange-600">
                    ${analytics?.payments?.total_revenue?.toFixed(2) || 0}
                  </p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>

            {/* Transactions Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Transactions</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics?.payments?.total_transactions || 0}
                  </p>
                </div>
                <div className="text-3xl">💳</div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Assessments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Assessments</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {analytics?.users?.assessments_completed || 0}
              </p>
              <p className="text-sm text-gray-600">Completed in last 30 days</p>
            </div>

            {/* Failed Transactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Failed Payments</h3>
              <p className="text-3xl font-bold text-red-600 mb-2">
                {analytics?.payments?.failed_transactions || 0}
              </p>
              <p className="text-sm text-gray-600">Need attention</p>
            </div>

            {/* Content Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Published Content</h3>
              <div className="space-y-2">
                {analytics?.content?.content_stats?.map((stat, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{stat.type}</span>
                    <span className="font-semibold">{stat.published_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
