// /frontend/src/pages/Upgrade/Level2.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import '../styles/Upgrade.css'; 

// 1. Import Language Utilities
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/LanguageSelector';

export default function UpgradeLevel2() {
  const navigate = useNavigate();
  
  // 2. Initialize Translation Hook
  const { t } = useLanguage();
  
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const prices = {
    USD: { price: 5, symbol: '$', locale: 'en-US' },
    INR: { price: 500, symbol: '₹', locale: 'en-IN' },
    GBP: { price: 5, symbol: '£', locale: 'en-GB' },
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Call your backend's /create-order endpoint
      const response = await api.post('/payments/create-order', {
        level: 2, 
        currency: currency 
      });

      // 2. Get the approval_url from the response
      const { approval_url } = response.data;

      // 3. Redirect the user to PayPal
      window.location.href = approval_url;

    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.detail || t('common.errorPayment') || 'Failed to create payment order');
      setLoading(false); 
    }
  };

  return (
    // Added 'relative' to container to support absolute positioning of the language selector
    <div className="upgrade-container" style={{ position: 'relative' }}>
      
      {/* 3. Language Selector Positioned Top-Right */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <LanguageSelector />
      </div>

      {/* Header */}
      <header className="upgrade-header">
        <div className="header-content">
          <h1>{t('upgrade.level2Title') || "Unlock Level 2"}</h1>
          <p>{t('upgrade.level2Subtitle') || "Extended Assessment for Deeper Insights"}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="upgrade-main">
        <div className="upgrade-wrapper">
          {/* Benefits Section */}
          <div className="benefits-card">
            <h2>{t('upgrade.benefitsTitle') || "What You'll Get"}</h2>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>{t('upgrade.benefit1Title') || "12 Advanced Questions"}</strong>
                  <p>{t('upgrade.benefit1Desc') || "Exploring deeper patterns across 12 life domains"}</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>{t('upgrade.benefit2Title') || "NLP-Based Reflection"}</strong>
                  <p>{t('upgrade.benefit2Desc') || "Questions to uncover limiting beliefs"}</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>{t('upgrade.benefit3Title') || "Personalized Feedback"}</strong>
                  <p>{t('upgrade.benefit3Desc') || "Tailored to your responses"}</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>{t('upgrade.benefit4Title') || "Cumulative Scoring"}</strong>
                  <p>{t('upgrade.benefit4Desc') || "That builds on Level 1 results"}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Pricing Section */}
          <div className="pricing-card">
            <h2>{t('upgrade.chooseCurrency') || "Choose Your Currency"}</h2>
            
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
              {loading ? (t('upgrade.redirecting') || 'Redirecting to PayPal...') : (t('upgrade.payBtn') || 'Pay with PayPal')}
            </button>

            <p className="payment-note">
              🔒 {t('upgrade.paypalNote') || "You will be redirected to PayPal to complete your payment."}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="comparison-card">
            <h3>{t('upgrade.comparisonTitle') || "Assessment Levels Comparison"}</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>{t('upgrade.feature') || "Feature"}</th>
                  <th>{t('upgrade.level1') || "Level 1"}</th>
                  <th>{t('upgrade.level2') || "Level 2"}</th>
                  <th>{t('upgrade.level3') || "Level 3"}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t('upgrade.questions') || "Questions"}</td>
                  <td>12</td>
                  <td>12</td>
                  <td>12</td>
                </tr>
                <tr>
                  <td>{t('upgrade.price') || "Price"}</td>
                  <td>{t('upgrade.free') || "Free"}</td>
                  <td>{prices[currency].symbol}{prices[currency].price}</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>{t('upgrade.depth') || "Depth"}</td>
                  <td>{t('upgrade.foundational') || "Foundational"}</td>
                  <td>⭐ {t('upgrade.intermediate') || "Intermediate"}</td>
                  <td>{t('upgrade.advanced') || "Advanced"}</td>
                </tr>
                <tr>
                  <td>{t('upgrade.feedback') || "Feedback"}</td>
                  <td>{t('upgrade.basic') || "Basic"}</td>
                  <td>⭐ {t('upgrade.detailed') || "Detailed"}</td>
                  <td>{t('upgrade.comprehensive') || "Comprehensive"}</td>
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
          ← {t('common.backToDashboard') || "Back to Dashboard"}
        </button>
      </footer>
    </div>
  );
}