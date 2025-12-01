// src/pages/Admin/UserDetails.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../config/api.js';

export default function UserDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (adminUser.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, assessRes, payRes] = await Promise.all([
          api.get(`/admin/users/${id}`),
          api.get(`/admin/users/${id}/assessments`),
          api.get(`/admin/users/${id}/payments`),
        ]);

        setUser(userRes.data);
        setAssessments(assessRes.data);
        setPayments(payRes.data);
      } catch (err) {
        console.error('Error fetching user details:', err);
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, adminUser.role]);

  if (loading) {
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
            <h1 className="text-3xl font-bold">User Details</h1>
            <Link
              to="/admin/users"
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              ← Back to Users
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-800">
                {user?.first_name} {user?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-lg font-semibold ${user?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {user?.is_active ? 'Active' : 'Suspended'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Assessments */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Assessment History</h2>
          {assessments.length === 0 ? (
            <p className="text-gray-600">No assessments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Level</th>
                    <th className="px-4 py-2 text-left">Domain</th>
                    <th className="px-4 py-2 text-left">Answer</th>
                    <th className="px-4 py-2 text-left">Score</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.slice(0, 5).map((a, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{a.level}</td>
                      <td className="px-4 py-2">{a.domain}</td>
                      <td className="px-4 py-2">{a.answer}</td>
                      <td className="px-4 py-2 font-semibold text-orange-600">{a.domain_score}</td>
                      <td className="px-4 py-2 text-gray-600">
                        {new Date(a.completed_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payments */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment History</h2>
          {payments.length === 0 ? (
            <p className="text-gray-600">No payments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Transaction ID</th>
                    <th className="px-4 py-2 text-left">Service</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 5).map((p, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{p.transaction_id.slice(0, 8)}...</td>
                      <td className="px-4 py-2">{p.service_type}</td>
                      <td className="px-4 py-2 font-semibold">
                        {p.amount} {p.currency}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            p.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {new Date(p.initiated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
