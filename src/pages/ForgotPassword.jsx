// ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setMsg('');

    try {
      console.log('📧 Sending forgot password request to:', `${API_BASE_URL}/api/users/forgot-password`);
      console.log('📧 Email:', email);

      const response = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('📧 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      // If we reach here, the request was successful
      setMsg(data.message || 'OTP has been sent to your email address. Please check your inbox.');

      // Navigate to OTP verification after a short delay
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 2000);

    } catch (err) {
      console.error('❌ Forgot password error:', err);

      if (err.message.includes('Failed to fetch')) {
        setMsg('Cannot connect to server. Please check your internet connection.');
      } else {
        setMsg(err.message || 'Error sending OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-600 font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter your registered email"
            />
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
                Sending OTP...
              </span>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>

        {msg && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm ${msg.includes('sent') || msg.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {msg}
          </div>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
