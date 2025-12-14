import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Menu, X, User, LogOut, Settings, ChevronDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch favorites count when user is logged in
  useEffect(() => {
    const fetchFavoritesCount = async () => {
      const token = localStorage.getItem('token');
      if (!user || !token) {
        setFavoritesCount(0);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFavoritesCount(data.count || 0);
        } else {
          setFavoritesCount(0);
        }
      } catch (error) {
        console.error('Error fetching favorites count:', error);
        setFavoritesCount(0);
      }
    };

    fetchFavoritesCount();

    // Set up an interval to refresh favorites count periodically
    const intervalId = setInterval(fetchFavoritesCount, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [user]);

  // Listen for favorite updates from other components
  useEffect(() => {
    const handleFavoriteUpdate = () => {
      // Trigger a refetch of favorites count
      const token = localStorage.getItem('token');
      if (user && token) {
        fetch(`${API_BASE_URL}/api/users/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.ok ? response.json() : { count: 0 })
          .then(data => setFavoritesCount(data.count || 0))
          .catch(() => setFavoritesCount(0));
      }
    };

    window.addEventListener('favoriteUpdated', handleFavoriteUpdate);
    return () => window.removeEventListener('favoriteUpdated', handleFavoriteUpdate);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
    setIsOpen(false);
    setFavoritesCount(0);
  };

  // Function to handle navigation and close menus
  const handleNavigation = (path) => {
    navigate(path);
    setIsProfileOpen(false);
    setIsOpen(false);
  };

  // Function to get user initial
  const getUserInitial = () => {
    if (!user) return '';

    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return <User className="w-4 h-4" />;
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
              Paplixo
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/templates" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Templates
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Pricing
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {/* Favorites Button */}
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/favorites')}
                  className="relative text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                >
                  <Heart className="w-4 h-4" fill="currentColor" />
                  {favoritesCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-pink-600 text-white text-xs">
                      {favoritesCount}
                    </Badge>
                  )}
                </Button> */}

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getUserInitial()}
                    </div>
                    <span className="text-gray-700 font-medium text-sm max-w-32 truncate">
                      {user.name || user.email}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={() => handleNavigation('/dashboard')}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => handleNavigation('/favorites')}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Heart className="w-4 h-4 mr-3" fill="currentColor" />
                        Favorites
                        <Badge className="ml-auto bg-pink-100 text-pink-600 text-xs">
                          {favoritesCount}
                        </Badge>
                      </button>

                      {/* <button
                        onClick={() => handleNavigation('/settings')}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button> */}

                      {/* Logout Button */}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
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
            <Link
              to="/templates"
              className="block text-gray-700 hover:text-blue-600 py-2"
              onClick={() => setIsOpen(false)}
            >
              Templates
            </Link>
            <Link
              to="/pricing"
              className="block text-gray-700 hover:text-blue-600 py-2"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-blue-600 py-2"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block text-gray-700 hover:text-blue-600 py-2"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                {/* Favorites Button for Mobile */}
                <button
                  onClick={() => handleNavigation('/favorites')}
                  className="flex items-center w-full text-gray-700 hover:text-pink-600 hover:bg-pink-50 py-2 px-4 rounded-lg transition-colors"
                >
                  <Heart className="w-4 h-4 mr-3" fill="currentColor" />
                  Favorites
                  {favoritesCount > 0 && (
                    <Badge className="ml-auto bg-pink-600 text-white text-xs">
                      {favoritesCount}
                    </Badge>
                  )}
                </button>

                {/* Mobile User Profile */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center space-x-3 py-2 px-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getUserInitial()}
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium text-sm">
                        {user.name || 'User'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigation('/dashboard')}
                    className="w-full mb-2"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </button>

                  {/* <button
                    onClick={() => handleNavigation('/settings')}
                    className="w-full mb-2"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </button> */}

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/login" className="block" onClick={() => setIsOpen(false)}>
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