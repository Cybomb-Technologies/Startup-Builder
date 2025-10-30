// VerifyOTP.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  // Handle OTP input change
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  // Handle key events for OTP inputs
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setMsg('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await response.json();
      console.log('OTP verification response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setMsg('OTP verified successfully! Redirecting to reset password...');
      
      // Navigate to reset password page
      setTimeout(() => {
        navigate('/reset-password', { 
          state: { 
            email, 
            resetToken: data.resetToken 
          } 
        });
      }, 1500);

    } catch (err) {
      console.error('OTP verification error:', err);
      setMsg(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setMsg('Email not found. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    setMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setMsg('New OTP has been sent to your email.');
    } catch (err) {
      setMsg(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">Email not found. Please go back and try again.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">Verify OTP</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter the 6-digit OTP sent to<br />
          <span className="font-medium">{email}</span>
        </p>
        
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={e => handleOtpChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onFocus={e => e.target.select()}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            ))}
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>
        
        {msg && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
            msg.includes('success') || msg.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {msg}
          </div>
        )}
        
        <div className="text-center mt-6 space-y-3">
          <button
            onClick={handleResendOtp}
            disabled={isLoading}
            className="text-blue-600 hover:underline text-sm font-medium block w-full"
          >
            Resend OTP
          </button>
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-gray-600 hover:underline text-sm font-medium"
          >
            Use different email
          </button>
        </div>
      </div>
    </div>
  );
}