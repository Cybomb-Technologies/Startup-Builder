
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              StartupDocs Builder
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/templates" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Templates
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Pricing
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Blog
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Contact
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Start Free
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 space-y-4"
          >
            <Link to="/templates" className="block text-gray-700 hover:text-blue-600 py-2">
              Templates
            </Link>
            <Link to="/pricing" className="block text-gray-700 hover:text-blue-600 py-2">
              Pricing
            </Link>
            <Link to="/blog" className="block text-gray-700 hover:text-blue-600 py-2">
              Blog
            </Link>
            <Link to="/about" className="block text-gray-700 hover:text-blue-600 py-2">
              About
            </Link>
            <Link to="/contact" className="block text-gray-700 hover:text-blue-600 py-2">
              Contact
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block py-2">
                  <Button variant="outline" className="w-full">Dashboard</Button>
                </Link>
                <Button variant="ghost" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                  Start Free
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
  