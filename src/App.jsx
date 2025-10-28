
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from "./pages/HomePage"
import TemplateLibraryPage from '@/pages/TemplateLibraryPage';
import EditorPage from '@/pages/EditorPage';
import PricingPage from '@/pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from '@/pages/AdminPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import BlogPage from '@/pages/BlogPage';
import LoginPage from '@/pages/LoginPage';
import AdminUploadPage from '@/pages/AdminUploadPage';
import ScrollToTop from "./components/ScrollToTop";
import PrivacyPolicy from "./components/PrivacyPolicy"
import TermsOfService from "./components/TermsPage";
import CookiesPolicy from "./components/CookiesPolicy";
import AccountsPage from "./pages/Categories/AccountsPage";
import HRPage from './pages/Categories/HrPage';
import LegalPage from './pages/Categories/Legal';
import BusinessPage from './pages/Categories/Business';
import MarketingPage from './pages/Categories/Marketing';
import Settings from "./pages/Settings"
import AdminLoginPage from './pages/AdminLogin';

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }) => {
  // Check if admin is logged in (from localStorage)
  const adminUser = localStorage.getItem('adminUser');
  
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ScrollToTop>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/templates" element={<TemplateLibraryPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminPage />} />

        {/* Protected Admin Dashboard Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          } 
        />
        
        <Route path="/admin/upload" element={<AdminUploadPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiesPolicy />} />
        <Route path="/categories/accounts" element={<AccountsPage />} />
        <Route path="/categories/hr" element={<HRPage />} />
        <Route path="/categories/legal" element={<LegalPage />} />
        <Route path="/categories/business" element={<BusinessPage />} />
        <Route path="/categories/marketing" element={<MarketingPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </ScrollToTop>
  );
}

export default App;
