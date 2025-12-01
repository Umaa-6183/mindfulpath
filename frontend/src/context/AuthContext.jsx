// /frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api.js'; // <-- This path now matches your structure

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  // This effect runs once to check if the user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Set the token on our api client
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch the user's profile
      api.get('/auth/me')
        .then(response => {
          setUser(response.data); // Set user in global state
        })
        .catch(() => {
          // Token was bad, log them out
          localStorage.removeItem('authToken');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false); // No token, stop loading
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('authToken', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData); // Set user in global state
      
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data?.detail || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { access_token, user: newUser } = response.data;
      
      localStorage.setItem('authToken', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(newUser);
      
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.detail || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    // Clear everything
    setUser(null);
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
    
    navigate('/login'); // Redirect to login page
  };

  // Show a loading screen while we check for a token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// This is the hook you use in your components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};