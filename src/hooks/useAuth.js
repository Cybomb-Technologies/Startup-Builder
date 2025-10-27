import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (email, password, userData = {}) => {
    // Generate unique ID
    const generateId = () => {
      return Math.random().toString(36).substr(2, 9);
    };

    // Create new user object
    const newUser = {
      id: generateId(),
      email: email,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      ...userData
    };
    
    // Store user in localStorage
    try {
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return newUser;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  };

  // Return auth state and methods
  return { 
    user, 
    loading,
    login, 
    logout, 
    register 
  };
};