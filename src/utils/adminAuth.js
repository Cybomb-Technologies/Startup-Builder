// src/utils/adminAuth.js

export const getAdminToken = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return null;
  if (!token.startsWith('eyJ')) return null;
  return token;
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

export const validateAdminSession = () => {
  const token = getAdminToken();
  if (!token) {
    adminLogout();
    return false;
  }
  return true;
};

export const getAuthHeaders = () => {
  const token = getAdminToken();
  if (!token) return {};
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};
