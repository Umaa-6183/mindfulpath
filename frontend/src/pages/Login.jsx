// /frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

import '../styles/theme.css';
import '../pages/styles/Upgrade.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New State for Password Toggle
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // The context login function usually throws an error if it fails
      await login(email, password);
      // Navigation happens automatically via AuthContext or we can force it here if needed
      // navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError('❌ Invalid email or password.');
      } else {
        setError('⚠️ Login failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upgrade-container">
      <main className="upgrade-main" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="pricing-card" style={{maxWidth: '450px', width: '100%', padding: '2rem'}}>
          
          <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Welcome Back</h2>

          {/* Red Error Alert Box */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              color: '#b91c1c',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              textAlign: 'center'
            }} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label htmlFor="email" style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Email <span style={{color: 'red'}}>*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc'}}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group" style={{marginBottom: '1.5rem'}}>
              <label htmlFor="password" style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Password <span style={{color: 'red'}}>*</span>
              </label>
              
              {/* Password Input Wrapper for relative positioning */}
              <div style={{position: 'relative'}}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"} // Dynamic Type
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{width: '100%', padding: '0.75rem', paddingRight: '40px', borderRadius: '0.5rem', border: '1px solid #ccc'}}
                  placeholder="Enter your password"
                />
                
                {/* Show/Hide Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: '#666'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-payment"
              style={{width: '100%', padding: '0.75rem', fontSize: '1rem'}}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="payment-note" style={{marginTop: '1.5rem', textAlign: 'center'}}>
            Don't have an account?{' '}
            <Link to="/register" style={{color: 'var(--color-orange)', fontWeight: '600', textDecoration: 'none'}}>
              Sign Up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}