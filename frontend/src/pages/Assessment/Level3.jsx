// /frontend/src/pages/Assessment/Level3.jsx (FINAL CORRECTED)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../config/api.js';
import '../styles/Assessment.css'; // This path is correct

// 1. Import Language Utilities
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/LanguageSelector';

export default function Level3Assessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 2. Initialize Translation Hook
  const { t } = useLanguage();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState('');

  // 3. Define Options inside component to enable translation
  const ANSWER_OPTIONS = {
    "A": t('assessment.optionA') || "Empowered / Integrated / Breakthrough",
    "B": t('assessment.optionB') || "Stable / Aware / Growing",
    "C": t('assessment.optionC') || "Struggling / Limited / Reactive",
    "D": t('assessment.optionD') || "Beginning / Exploring / Needs Support"
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get('/assessment/questions/3');
        setQuestions(response.data.questions);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(t('common.errorAccess') || 'Failed to load assessment. You may not have access to this level.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [navigate, t]);

  const handleAnswerChange = (questionIndex, answerKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerKey, 
    }));
    setError(''); 
  };

  const handleNext = () => {
    if (!answers[currentQuestion]) {
      setError(t('assessment.selectAnswerError') || 'Please select an answer to continue.');
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setError(t('assessment.answerAllError') || 'Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const formattedAnswers = {};
      Object.entries(answers).forEach(([index, answerKey]) => {
        formattedAnswers[index] = answerKey;
      });
      
      await api.post('/assessment/submit/3', { answers: formattedAnswers });
      
      alert(t('assessment.level3SubmitSuccess') || 'Assessment Complete! Generating your report...');
      navigate('/report'); // Navigate to the final report page
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError(err.response?.data?.detail || t('common.errorSubmit') || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="assessment-loading">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>{t('common.loading') || "Loading Level 3 Assessment..."}</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="assessment-error">
        <p>{error || t('common.noQuestions') || 'No questions available'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          {t('common.backToDashboard') || "Back to Dashboard"}
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="assessment-container">
      {/* Header */}
      <header className="assessment-header">
        <div className="header-content">
          <div className="header-title">
            <h1>{t('assessment.level3') || "Level 3: Intensive Assessment"}</h1>
            <p>{t('assessment.level3Sub') || "Transform your understanding with deep insights & 30-day roadmap"}</p>
          </div>
          
          {/* 4. Action Area: Language Selector + Dashboard Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LanguageSelector />
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/dashboard')}
            >
              ← {t('common.dashboard') || "Dashboard"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="assessment-main">
        <div className="assessment-wrapper">
          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-text">
                {t('assessment.question') || "Question"} {currentQuestion + 1} {t('assessment.of') || "of"} {questions.length}
              </span>
              <span className="progress-percent">{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="question-card">
            <div className="question-header">
              <span className="domain-badge">{question.domain}</span>
              <span className="level-badge level-3">{t('assessment.level3badge') || "Level 3 (Intensive)"}</span>
            </div>

            <h2 className="question-title">
              <span style={{ color: '#f97316', marginRight: '8px' }}>
                {currentQuestion + 1}.
              </span>
              {question.question}
            </h2>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Options */}
            <div className="options-container">
              {Object.entries(ANSWER_OPTIONS).map(([key, value]) => (
                <label key={key} className="option-label">
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={key}
                    checked={answers[currentQuestion] === key}
                    onChange={() => handleAnswerChange(currentQuestion, key)}
                    className="option-input"
                  />
                  <span className="option-text">{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="navigation-buttons">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="btn btn-outline"
            >
              ← {t('common.previous') || "Previous"}
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !answers[currentQuestion]}
                className="btn btn-primary btn-lg"
              >
                {submitting ? (t('common.submitting') || 'Submitting...') : (t('assessment.completeReport') || 'Complete Assessment & Get Report')}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion]}
                className="btn btn-primary"
              >
                {t('assessment.nextBtn') || "Next"} →
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="assessment-summary">
            <p>🚀 {t('assessment.level3Motivation') || "You're almost done! Final insights and personalized roadmap awaiting."}</p>
          </div>
        </div>
      </main>
    </div>
  );
}