// /frontend/src/pages/Assessment/Level1.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.js';
import '../styles/Assessment.css'; // This file provides all the styling

// These are the 4 options from your "Scoring Scale.pdf"
const ANSWER_OPTIONS = {
  "A": "Empowered / Integrated / Breakthrough",
  "B": "Stable / Aware / Growing",
  "C": "Struggling / Limited / Reactive",
  "D": "Beginning / Exploring / Needs Support"
};

export default function Level1Assessment() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState(''); // State for error messages

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get('/assessment/questions/1');
        setQuestions(response.data.questions);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load assessment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [navigate]);

  const handleAnswerChange = (questionIndex, answerKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerKey,
    }));
    setError(''); // Clear error on new selection
  };
  
  const handleNext = () => {
    if (!answers[currentQuestion]) {
      setError('Please select an answer to continue.');
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
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      // Format the answers for the backend API
      const formattedAnswers = {};
      Object.entries(answers).forEach(([index, answerKey]) => {
        formattedAnswers[index] = answerKey;
      });
      
      await api.post('/assessment/submit/1', { answers: formattedAnswers });
      
      alert('Assessment submitted successfully! View your report.');
      navigate('/report'); // Go to the report page after
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError(err.response?.data?.detail || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="assessment-loading">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
       <div className="assessment-loading">
         <div className="assessment-error">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
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
            <h1>Level 1: Free Assessment</h1>
            <p>Discover your wellness baseline</p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/dashboard')}
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="assessment-main">
        <div className="assessment-wrapper">
           {/* Progress Bar */}
           <div className="progress-section">
            <div className="progress-info">
              <span className="progress-text">
                Question {currentQuestion + 1} of {questions.length}
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
              <span className="domain-badge">{question?.domain}</span>
              <span className="level-badge">Level 1</span>
            </div>

            <h2 className="question-title">{question?.question}</h2>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Options */}
            <div className="options-container">
              {Object.entries(ANSWER_OPTIONS).map(([key, value]) => (
                <label
                  key={key}
                  className="option-label"
                >
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
              ← Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !answers[currentQuestion]}
                className="btn btn-primary btn-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion]}
                className="btn btn-primary"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}