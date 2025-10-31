import { useState, useEffect, createContext, useContext } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to validate token with server
  const validateToken = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/validate-token`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        console.log('🔐 Auth check - Stored user:', !!storedUser, 'Stored token:', !!storedToken);
        
        if (storedUser && storedToken) {
          // Validate token with server
          const isValid = await validateToken(storedToken);
          if (isValid) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            console.log('✅ Token validated, user logged in');
          } else {
            // Clear invalid token
            console.log('❌ Token invalid, clearing storage');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        } else {
          // Clear both if one is missing
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, authToken) => {
    console.log('🔐 Login called with:', { userData, token: authToken ? 'Present' : 'Missing' });
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    console.log('🔐 Logout called');
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!(user && token) // Helper to check both
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;