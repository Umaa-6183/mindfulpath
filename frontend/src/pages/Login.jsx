// /frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../context/AuthContext.jsx';

// --- FIX: Import your new professional CSS files ---
import '../styles/theme.css';
import '../pages/styles/Upgrade.css'; // This contains your .form-container styles

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
      // The context handles navigation on success
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- FIX: Use the new CSS classes from your files ---
    <div className="upgrade-container"> {/* Use .upgrade-container for the bg and layout */}
      <main className="upgrade-main" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="pricing-card" style={{maxWidth: '450px'}}> {/* Re-use the pricing card for the white box */}
          
          <h2 style={{textAlign: 'center'}}>Welcome Back</h2>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-payment" // Use .btn classes for styling
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="payment-note" style={{marginTop: '1rem'}}>
            Don't have an account?{' '}
            {/* Use <Link> for React routing, not <a> */}
            <Link to="/register" style={{color: 'var(--color-orange)', fontWeight: '600'}}>
              Sign Up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}