import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Temporary basic components (keep these as is)
const TemporaryButton = ({ children, onClick, disabled, className = '', type = 'button' }) => (
  <button 
    type={type}
    onClick={onClick} 
    disabled={disabled}
    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors ${className}`}
  >
    {children}
  </button>
);

const TemporaryInput = ({ placeholder, type = 'text', value, onChange, name }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    name={name}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
);

const TemporaryCard = ({ children }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
    {children}
  </div>
);

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save admin session
        localStorage.setItem('adminUser', JSON.stringify({
          email: data.user.email,
          name: data.user.name,
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
          token: data.token
        }));
        
        console.log('Login successful, redirecting to admin dashboard...');
        navigate('/admin');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <TemporaryCard>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Enter your credentials to continue</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <TemporaryInput
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <TemporaryInput
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In to Admin Dashboard'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
          >
            ← Back to Main Site
          </button>
        </div>
      </TemporaryCard>
    </div>
  );
};

export default AdminLoginPage;