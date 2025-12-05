// /frontend/src/pages/Upgrade/Level3.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import '../styles/Upgrade.css'; 

// 1. Import Language Utilities
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/LanguageSelector';

export default function UpgradeLevel3() {
  const navigate = useNavigate();
  
  // 2. Initialize Translation Hook
  const { t } = useLanguage();
  
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prices for Level 3
  const prices = {
    USD: { price: 10, symbol: '$', locale: 'en-US' },
    INR: { price: 1000, symbol: '₹', locale: 'en-IN' },
    GBP: { price: 10, symbol: '£', locale: 'en-GB' },
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Call your backend's /create-order endpoint
      const response = await api.post('/payments/create-order', {
        level: 3, 
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
    // Added 'relative' to container to support absolute positioning of language selector
    <div className="upgrade-container" style={{ position: 'relative' }}>
      
      {/* 3. Language Selector Positioned Top-Right */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <LanguageSelector />
      </div>

      {/* Header */}
      <header className="upgrade-header premium">
        <div className="header-content">
          <div className="premium-badge">{t('upgrade.premiumBadge') || "PREMIUM"}</div>
          <h1>{t('upgrade.level3Title') || "Unlock Level 3"}</h1>
          <p>{t('upgrade.level3Subtitle') || "Intensive Assessment + 30-Day Transformation Roadmap"}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="upgrade-main">
        <div className="upgrade-wrapper">
          {/* Premium Benefits */}
          <div className="benefits-card premium-benefits">
            <h2>🌟 {t('upgrade.premiumExperience') || "Premium Experience"}</h2>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">🚀</span>
                <div>
                  <strong>{t('upgrade.benefitL3_1_Title') || "12 Transformation Questions"}</strong>
                  <p>{t('upgrade.benefitL3_1_Desc') || "Breakthrough-level assessment"}</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">🎯</span>
                <div>
                  <strong>{t('upgrade.benefitL3_2_Title') || "30-Day Personalized Roadmap"}</strong>
                  <p>{t('upgrade.benefitL3_2_Desc') || "Your unique path to transformation"}</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">📊</span>
                <div>
                  <strong>{t('upgrade.benefitL3_3_Title') || "Comprehensive Report"}</strong>
                  <p>{t('upgrade.benefitL3_3_Desc') || "Detailed analysis & recommendations"}</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">💬</span>
                <div>
                  <strong>{t('upgrade.benefitL3_4_Title') || "Coaching Access"}</strong>
                  <p>{t('upgrade.benefitL3_4_Desc') || "Optional 1-on-1 consultation"}</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">🏆</span>
                <div>
                  <strong>{t('upgrade.benefitL3_5_Title') || "Premium Resources"}</strong>
                  <p>{t('upgrade.benefitL3_5_Desc') || "Advanced content & practices"}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Pricing Section */}
          <div className="pricing-card premium-pricing">
            <h2>{t('upgrade.completeJourney') || "Complete Your Journey"}</h2>
            
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
              {loading ? (t('upgrade.redirecting') || 'Redirecting to PayPal...') : (t('upgrade.beginPremium') || 'Begin Premium Assessment')}
            </button>

            <div className="satisfaction-guarantee">
              <p>💯 <strong>{t('upgrade.satisfaction') || "100% Satisfaction Guaranteed"}</strong></p>
              <p>{t('upgrade.refundPolicy') || "Not satisfied? Full refund within 7 days."}</p>
            </div>
          </div>

          {/* Full Comparison */}
          <div className="comparison-card full-comparison">
            <h3>{t('upgrade.completeJourneyTable') || "Complete Assessment Journey"}</h3>
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
                  <td>$5 / £5 / ₹500</td>
                  {/* FIX: Use the selected currency for L3 price */}
                  <td>🌟 {prices[currency].symbol}{prices[currency].price}</td>
                </tr>
                <tr>
                  <td>{t('upgrade.assessmentType') || "Assessment Type"}</td>
                  <td>{t('upgrade.foundation') || "Foundation"}</td>
                  <td>{t('upgrade.intermediate') || "Intermediate"}</td>
                  <td>🌟 {t('upgrade.breakthrough') || "Breakthrough"}</td>
                </tr>
                <tr>
                  <td>{t('upgrade.reportDepth') || "Report Depth"}</td>
                  <td>{t('upgrade.basic') || "Basic"}</td>
                  <td>{t('upgrade.detailed') || "Detailed"}</td>
                  <td>🌟 {t('upgrade.comprehensive') || "Comprehensive"}</td>
                </tr>
                <tr>
                  <td>{t('upgrade.roadmap') || "Roadmap"}</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>🌟 {t('upgrade.plan30Day') || "30-Day Plan"}</td>
                </tr>
                <tr>
                  <td>{t('upgrade.coaching') || "Coaching"}</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>🌟 {t('upgrade.available') || "Available"}</td>
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