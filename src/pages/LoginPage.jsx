import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Lock, FileText, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isSignup ? 'register' : 'login';
      const url = `${API_BASE_URL}/api/users/${endpoint}`;

      const body = isSignup ? { username, email, password } : { email, password };

      console.log('🔐 Making auth request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('🔐 Auth response:', { success: response.ok, data });

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      // ✅ Use auth context to login (this will set both user and token)
      if (data.token && data.user) {
        login(data.user, data.token);
        console.log('✅ Login successful, user and token stored');
      } else {
        throw new Error('Invalid response from server - missing token or user data');
      }

      toast({
        title: isSignup ? 'Account Created 🎉' : 'Welcome Back 👋',
        description: data.message || 'Login successful!',
      });

      // Redirect to home or intended page
      navigate('/templates');
    } catch (error) {
      console.error('❌ Auth error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isSignup ? 'Sign Up' : 'Login'} - StartupDocs Builder</title>
        <meta
          name="description"
          content="Access your StartupDocs Builder account to manage your documents."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold mb-2">StartupDocs Builder</h1>
              <p className="text-blue-100">
                {isSignup ? 'Join us today!' : 'Simplify Compliance. Amplify Growth.'}
              </p>
            </div>

            {/* Form */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                {isSignup ? 'Create Account' : 'Welcome Back'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                        className="pl-10"
                        required
                        minLength={3}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-lg py-6 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isSignup ? 'Creating Account...' : 'Logging in...'}
                    </div>
                  ) : isSignup ? (
                    'Sign Up'
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {isSignup
                    ? 'Already have an account? Login'
                    : "Don't have an account? Sign up"}
                </button>
              </div>

              {!isSignup && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-blue-500 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-center text-sm text-blue-800">
                <strong>Note:</strong> Connected to API at{' '}
                <code className="bg-blue-100 px-1 rounded">{API_BASE_URL}</code>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;