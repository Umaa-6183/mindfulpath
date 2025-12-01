// src/pages/Admin/Users.js

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/api.js';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await api.get(`/admin/users?skip=${skip}&limit=10`);
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [skip, navigate, user.role]);

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
            <h1 className="text-3xl font-bold">Users Management</h1>
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
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="text-blue-600 hover:underline text-sm font-semibold"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setSkip(Math.max(0, skip - 10))}
            disabled={skip === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="text-gray-600">Page {Math.floor(skip / 10) + 1}</span>
          <button
            onClick={() => setSkip(skip + 10)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
