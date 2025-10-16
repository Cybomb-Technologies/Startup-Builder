
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Lock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userData = {
      email,
      name: isSignup ? name : email.split('@')[0],
      isAdmin: false
    };
    
    login(userData);
    
    toast({
      title: isSignup ? "Account Created!" : "Welcome Back!",
      description: isSignup ? "Your account has been created successfully." : "You've been logged in successfully."
    });
    
    navigate('/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>{isSignup ? 'Sign Up' : 'Login'} - StartupDocs Builder</title>
        <meta name="description" content="Access your StartupDocs Builder account to manage your business documents." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold mb-2">StartupDocs Builder</h1>
              <p className="text-blue-100">Simplify Compliance. Amplify Growth.</p>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isSignup ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-600">
                  {isSignup ? 'Start your free trial today' : 'Login to access your documents'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-lg py-6">
                  {isSignup ? 'Create Account' : 'Login'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 text-center">
                  <strong>Demo Mode:</strong> This is using localStorage for authentication. For production, integrate with Firebase Auth or Auth0!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
  