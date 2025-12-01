// /frontend/src/pages/Upgrade/Level3.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import '../styles/Upgrade.css'; // Uses your professional CSS

export default function UpgradeLevel3() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prices for Level 3
  const prices = {
    USD: { price: 10, symbol: '$', locale: 'en-US' },
    INR: { price: 1000, symbol: '₹', locale: 'en-IN' },
    GBP: { price: 10, symbol: '£', locale: 'en-GB' },
  };

  // --- THIS IS THE NEW, CORRECT PAYPAL LOGIC ---
  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Call your backend's /create-order endpoint
      const response = await api.post('/payments/create-order', {
        level: 3, // This page is for Level 3
        currency: currency // Use the currency from the component's state
      });

      // 2. Get the approval_url from the response
      const { approval_url } = response.data;

      // 3. Redirect the user to PayPal
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
      <header className="upgrade-header premium">
        <div className="header-content">
          <div className="premium-badge">PREMIUM</div>
          <h1>Unlock Level 3</h1>
          <p>Intensive Assessment + 30-Day Transformation Roadmap</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="upgrade-main">
        <div className="upgrade-wrapper">
          {/* Premium Benefits */}
          <div className="benefits-card premium-benefits">
            <h2>🌟 Premium Experience</h2>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">🚀</span>
                <div>
                  <strong>12 Transformation Questions</strong>
                  <p>Breakthrough-level assessment</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">🎯</span>
                <div>
                  <strong>30-Day Personalized Roadmap</strong>
                  <p>Your unique path to transformation</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">📊</span>
                <div>
                  <strong>Comprehensive Report</strong>
                  <p>Detailed analysis & recommendations</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">💬</span>
                <div>
                  <strong>Coaching Access</strong>
                  <p>Optional 1-on-1 consultation</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">🏆</span>
                <div>
                  <strong>Premium Resources</strong>
                  <p>Advanced content & practices</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Pricing Section */}
          <div className="pricing-card premium-pricing">
            <h2>Complete Your Journey</h2>
            
            {error && <div className="error-message">{error}</div>}

            <div className="currency-selector premium">
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
              className="btn btn-primary btn-lg btn-payment premium-btn"
            >
              {loading ? 'Redirecting to PayPal...' : 'Begin Premium Assessment'}
            </button>

            <div className="satisfaction-guarantee">
              <p>💯 <strong>100% Satisfaction Guaranteed</strong></p>
              <p>Not satisfied? Full refund within 7 days.</p>
            </div>
          </div>

          {/* Full Comparison */}
          <div className="comparison-card full-comparison">
            <h3>Complete Assessment Journey</h3>
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
                  <td>$5 / £5 / ₹500</td>
                  {/* FIX: Use the selected currency for L3 price */}
                  <td>🌟 {prices[currency].symbol}{prices[currency].price}</td>
                </tr>
                <tr>
                  <td>Assessment Type</td>
                  <td>Foundation</td>
                  <td>Intermediate</td>
                  <td>🌟 Breakthrough</td>
                </tr>
                <tr>
                  <td>Report Depth</td>
                  <td>Basic</td>
                  <td>Detailed</td>
                  <td>🌟 Comprehensive</td>
                </tr>
                <tr>
                  <td>Roadmap</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>🌟 30-Day Plan</td>
                </tr>
                <tr>
                  <td>Coaching</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>🌟 Available</td>
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