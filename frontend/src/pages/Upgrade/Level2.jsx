// /frontend/src/pages/Upgrade/Level2.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import '../styles/Upgrade.css'; // Uses your new, professional CSS

export default function UpgradeLevel2() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const prices = {
    USD: { price: 5, symbol: '$', locale: 'en-US' },
    INR: { price: 500, symbol: '₹', locale: 'en-IN' },
    GBP: { price: 5, symbol: '£', locale: 'en-GB' },
  };

  // --- THIS IS THE NEW, CORRECT PAYPAL LOGIC ---
  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Call your backend's /create-order endpoint
      const response = await api.post('/payments/create-order', {
        level: 2, // This page is for Level 2
        currency: currency // Use the currency from the component's state
      });

      // 2. Get the approval_url from the response
      const { approval_url } = response.data;

      // 3. Redirect the user to PayPal
      // This will navigate the user away from your site to PayPal
      window.location.href = approval_url;

    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.detail || 'Failed to create payment order');
      setLoading(false); // Only set loading to false if there's an error
    }
  };
  // --- END OF NEW LOGIC ---

  return (
    <div className="upgrade-container">
      {/* Header */}
      <header className="upgrade-header">
        <div className="header-content">
          <h1>Unlock Level 2</h1>
          <p>Extended Assessment for Deeper Insights</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="upgrade-main">
        <div className="upgrade-wrapper">
          {/* Benefits Section */}
          <div className="benefits-card">
            <h2>What You'll Get</h2>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>12 Advanced Questions</strong>
                  <p>Exploring deeper patterns across 12 life domains</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>NLP-Based Reflection</strong>
                  <p>Questions to uncover limiting beliefs</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>Personalized Feedback</strong>
                  <p>Tailored to your responses</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>Cumulative Scoring</strong>
                  <p>That builds on Level 1 results</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Pricing Section */}
          <div className="pricing-card">
            <h2>Choose Your Currency</h2>
            
            {error && <div className="error-message">{error}</div>}

            <div className="currency-selector">
              {Object.entries(prices).map(([curr, data]) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`currency-button ${currency === curr ? 'active' : ''}`}
                >
                  <div className="currency-name">{curr}</div>
                  <div className="currency-price">
                    {data.symbol}
                    {data.price}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="btn btn-primary btn-lg btn-payment"
            >
              {loading ? 'Redirecting to PayPal...' : 'Pay with PayPal'}
            </button>

            <p className="payment-note">
              🔒 You will be redirected to PayPal to complete your payment.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="comparison-card">
            <h3>Assessment Levels Comparison</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Level 1</th>
                  <th>Level 2</th>
                  <th>Level 3</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Questions</td>
                  <td>12</td>
                  <td>12</td>
                  <td>12</td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td>Free</td>
                  <td>{prices[currency].symbol}{prices[currency].price}</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Depth</td>
                  <td>Foundational</td>
                  <td>⭐ Intermediate</td>
                  <td>Advanced</td>
                </tr>
                <tr>
                  <td>Feedback</td>
                  <td>Basic</td>
                  <td>⭐ Detailed</td>
                  <td>Comprehensive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="upgrade-footer">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline"
        >
          ← Back to Dashboard
        </button>
      </footer>
    </div>
  );
}