// Admin Authentication Utilities

// Store admin session
export const adminLogin = (token, adminData) => {
  if (!token || !token.startsWith('eyJ')) {
    console.error('❌ Invalid token format during login');
    return false;
  }
  
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminUser', JSON.stringify(adminData));
  console.log('✅ Admin session stored successfully');
  return true;
};

// Clear admin session
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  console.log('✅ Admin session cleared');
  window.location.href = '/admin/login';
};

// Get admin token with validation
export const getAdminToken = () => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    console.log('❌ No admin token found');
    return null;
  }
  
  // Validate token format (JWT tokens start with 'eyJ' and are typically > 100 chars)
  if (token.startsWith('eyJ') && token.length > 100) {
    return token;
  } else {
    console.error('❌ Invalid token format detected');
    adminLogout();
    return null;
  }
};

// Check if admin is logged in
export const isAdminLoggedIn = () => {
  const token = getAdminToken();
  const adminUser = localStorage.getItem('adminUser');
  
  if (token && adminUser) {
    try {
      const userData = JSON.parse(adminUser);
      return !!(userData && userData.isLoggedIn);
    } catch (error) {
      console.error('❌ Error parsing admin user data:', error);
      return false;
    }
  }
  return false;
};

// Get admin user data
export const getAdminUser = () => {
  try {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser ? JSON.parse(adminUser) : null;
  } catch (error) {
    console.error('❌ Error getting admin user:', error);
    return null;
  }
};

// Validate token before making API calls
export const validateAdminSession = () => {
  if (!isAdminLoggedIn()) {
    console.log('❌ Admin session validation failed');
    adminLogout();
    return false;
  }
  return true;
};