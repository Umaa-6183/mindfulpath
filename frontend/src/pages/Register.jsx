// /frontend/src/pages/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api.js'; // Using direct API for clearer error handling

export default function Register() {
  const navigate = useNavigate();
  
  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    terms_accepted: false,
    privacy_accepted: false,
    consent_accepted: false
  });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific field error when user types
    if (fieldErrors[name]) {
        setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validation Logic
  const validateForm = () => {
    const errors = {};
    const pwd = formData.password;

    // Email
    if (!formData.email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Please enter a valid email address.";
    
    // Password Complexity
    if (!pwd) {
      errors.password = "Password is required.";
    } else {
      if (pwd.length < 8) errors.password = "Password must be at least 8 characters.";
      else if (!/[A-Z]/.test(pwd)) errors.password = "Password must contain an Uppercase letter.";
      else if (!/[0-9]/.test(pwd)) errors.password = "Password must contain a Number.";
      else if (!/[!@#$%^&*]/.test(pwd)) errors.password = "Password must contain a Special Character (!@#$%^&*).";
    }

    // Checkboxes
    if (!formData.terms_accepted) errors.terms = "Required";
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    
    if (!validateForm()) return; // Stop if validation fails

    setIsSubmitting(true);

    try {
      await api.post('/auth/register', formData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error('Registration Error:', err);
      // Display backend error message nicely
      const msg = err.response?.data?.detail || "Registration failed. Please try again.";
      setGlobalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get input border classes based on error state
  const getInputClass = (fieldName) => {
    return `w-full px-4 py-2 border rounded-lg outline-none transition-colors ${
      fieldErrors[fieldName] 
        ? 'border-red-500 bg-red-50 focus:border-red-500' 
        : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
    }`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
          <p className="text-gray-500 mt-2 text-sm">Join MindfulPath today</p>
        </div>

        {/* Global Error Message */}
        {globalError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
            {globalError}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
              <input
                name="first_name"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
              <input
                name="last_name"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>
        
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              className={getInputClass('email')}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.email}</p>}
          </div>

          {/* Password with Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className={getInputClass('password')}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min. 8 chars, 1 upper, 1 special..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password ? (
                <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.password}</p>
            ) : (
                <p className="text-xs text-gray-500 mt-1">
                  8+ chars, 1 Uppercase, 1 Number, 1 Special Char.
                </p>
            )}
          </div>
          
          {/* Consent Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                name="terms_accepted"
                type="checkbox"
                className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                checked={formData.terms_accepted}
                onChange={handleChange}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800">
                I agree to the <span className="text-blue-600 hover:underline">Terms & Conditions</span>. <span className="text-red-500">*</span>
              </span>
            </label>
            {fieldErrors.terms && <p className="text-xs text-red-500 ml-7 font-medium">{fieldErrors.terms}</p>}
            
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                name="privacy_accepted"
                type="checkbox"
                className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                checked={formData.privacy_accepted}
                onChange={handleChange}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800">
                I agree to the <span className="text-blue-600 hover:underline">Privacy Policy</span>. <span className="text-red-500">*</span>
              </span>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                name="consent_accepted"
                type="checkbox"
                className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                checked={formData.consent_accepted}
                onChange={handleChange}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800">
                I consent to data processing. <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-md transition-all transform active:scale-95 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg'
            }`}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}