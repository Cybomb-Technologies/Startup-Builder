// ResetPassword.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { email, resetToken } = location.state || {};

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMsg('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setMsg('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg('Passwords do not match');
      return;
    }

    if (!resetToken) {
      setMsg('Invalid reset token. Please start the process again.');
      return;
    }

    setIsLoading(true);
    setMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          newPassword
        }),
      });

      const data = await response.json();
      console.log('Reset password response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      setMsg('Password reset successfully! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Reset password error:', err);
      setMsg(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Session Expired</h2>
          <p className="text-gray-600 mb-6">Please start the password reset process again.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Reset Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Setting new password for<br />
          <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-gray-600 font-medium mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter new password (min. 6 characters)"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Confirm your new password"
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
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {msg && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm ${msg.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
