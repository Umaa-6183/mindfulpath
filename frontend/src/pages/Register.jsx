// /frontend/src/pages/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
// We no longer need the broken CSS imports because we're using Tailwind

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const allConsentsGiven = termsAccepted && privacyAccepted && consentAccepted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!allConsentsGiven) {
      setError('You must accept all terms and policies to register.');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        terms_accepted: termsAccepted,
        privacy_accepted: privacyAccepted,
        consent_accepted: consentAccepted,
      });
      
      if (result && !result.success) {
        setError(result.error || 'Registration failed');
      }
      // The context handles navigation on success
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Re-styled with Tailwind CSS for clean, consistent layout ---

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Create Your Account
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* First and Last Name Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
        
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min. 8 chars, 1 upper, 1..."
            />
            <p className="text-xs text-gray-500">
              Min. 8 chars, 1 uppercase, 1 number, 1 special character.
            </p>
          </div>
          
          {/* Consent Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 text-orange-600 border-gray-300 rounded mt-0.5 mr-3 shrink-0 focus:ring-orange-500"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span>
                I have read and agree to the{' '}
                <a 
                  href="/terms_and_conditions.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Terms & Conditions
                </a>.
              </span>
            </label>
            
            <label className="flex items-start text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 text-orange-600 border-gray-300 rounded mt-0.5 mr-3 shrink-0 focus:ring-orange-500"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
              />
              <span>
                I have read and agree to the{' '}
                <a 
                  href="/privacy_policy.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Privacy Policy
                </a>.
              </span>
            </label>
            
            <label className="flex items-start text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 text-orange-600 border-gray-300 rounded mt-0.5 mr-3 shrink-0 focus:ring-orange-500"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
              />
              <span>
                I consent to the processing of my data as described.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !allConsentsGiven}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}