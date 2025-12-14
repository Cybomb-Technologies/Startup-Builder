import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';
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
    password: ''
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
      console.log('🔐 Attempting admin login...');
      const url = `${API_BASE_URL}/api/admin/login`;

      const response = await fetch(url, {
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
      console.log('📡 Login response:', data);

      if (response.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        // 🎯 CRITICAL FIX: Store token in adminUser object (like your reference code)
        localStorage.setItem('adminUser', JSON.stringify({
          email: data.user.email,
          name: data.user.name,
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
          token: data.token  // ✅ Store token here like your reference code
        }));

        console.log('✅ Login successful, session saved');
        console.log('🔄 Redirecting to admin dashboard...');

        // 🎯 Use the same redirect method as your reference code
        navigate('/admin/dashboard');

      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        console.error('❌ Login failed:', data.message);
      }
    } catch (error) {
      console.error('❌ Network error during login:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Test redirect function
  const testRedirect = () => {
    console.log('🧪 Testing redirect manually...');
    navigate('/admin/dashboard');
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

        {/* Debug section */}
        {/* <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800 text-center mb-2">
            <strong>Testing:</strong> If redirect doesn't work, try these:
          </p>
          <div className="flex gap-2">
            <button 
              onClick={testRedirect}
              className="flex-1 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Test Redirect
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('adminUser');
                console.log('🧹 Storage cleared');
              }}
              className="flex-1 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Clear Storage
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Don't have an admin account?</p>
          <button 
            onClick={() => navigate('/admin/register')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            Register Admin Account
          </button>
        </div> */}

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