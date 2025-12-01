// /frontend/src/pages/Payment/PaymentSuccess.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../config/api.js';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verifying your payment...');
  const [error, setError] = useState('');

  useEffect(() => {
    // 5. Get paymentId and PayerID from the URL
    const paymentId = searchParams.get('paymentId');
    const PayerID = searchParams.get('PayerID');

    if (!paymentId || !PayerID) {
      setError('Invalid payment details. Please try again.');
      setStatus('Error');
      return;
    }

    const executePayment = async () => {
      try {
        // 5. Call your backend to finalize the payment
        const response = await api.post('/payments/execute-payment', {
          paymentId: paymentId,
          PayerID: PayerID,
        });

        // --- THIS IS THE FIX ---
        // 5. Check what level was purchased and redirect
        const purchasedLevel = response.data.level;

        setStatus('Payment Successful!');
        setError('');
        
        // Redirect to the correct assessment
        setTimeout(() => {
          if (purchasedLevel === 2) {
            navigate('/assessment/level2');
          } else if (purchasedLevel === 3) {
            navigate('/assessment/level3');
          } else {
            // Fallback to dashboard
            navigate('/dashboard');
          }
        }, 3000);
        // --- END OF FIX ---

      } catch (err) {
        console.error('Payment execution failed:', err);
        setError('Your payment could not be processed. Please contact support.');
        setStatus('Payment Failed');
      }
    };

    executePayment();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-10 rounded-lg shadow-lg">
        {status === 'Verifying your payment...' && (
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
        )}
        
        {status === 'Payment Successful!' && (
          <div className="text-green-500 text-6xl mb-4">✅</div>
        )}

        {status === 'Payment Failed' && (
          <div className="text-red-500 text-6xl mb-4">❌</div>
        )}

        <h1 className="text-2xl font-bold text-gray-800 mt-4">{status}</h1>
        
        {error ? (
          <p className="text-red-600 mt-2">{error}</p>
        ) : (
          <p className="text-gray-600 mt-2">
            {status === 'Payment Successful!' ? 'Redirecting to your assessment...' : 'Please wait.'}
          </p>
        )}
        
        {error && (
           <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}