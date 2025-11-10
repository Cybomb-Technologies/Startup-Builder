import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from "./components/ScrollToTop";
import { useAuth } from "@/hooks/useAuth";

// ===== User Pages =====
import HomePage from "./pages/HomePage";
import TemplateLibraryPage from "@/pages/TemplateLibraryPage";
import EditorPage from "@/pages/EditorPage";
import PricingPage from "@/pages/PricingPage";
import DashboardPage from "@/pages/DashboardPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import BlogPage from "@/pages/BlogPage";
import LoginPage from "@/pages/LoginPage";
import Settings from "@/pages/Settings";

// ===== Auth Pages =====
import ForgotPassword from "@/pages/ForgotPassword";
import VerifyOtp from "@/pages/VerifyOtp";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

// ===== Admin Pages =====
import AdminPage from "@/pages/AdminPage";
import AdminLoginPage from "@/pages/AdminLogin";
import AdminUploadPage from "@/pages/AdminUploadPage";
import ContactSubmissions from "@/pages/ContactSubmissions";

// ===== Legal Pages =====
import PrivacyPolicy from "@/components/PrivacyPolicy";
import TermsOfService from "@/components/TermsPage";
import CookiesPolicy from "@/components/CookiesPolicy";

// ===== Categories =====
import AccountsPage from "@/pages/Categories/AccountsPage";
import HRPage from "@/pages/Categories/HrPage";
import LegalPage from "@/pages/Categories/Legal";
import BusinessPage from "@/pages/Categories/Business";
import MarketingPage from "@/pages/Categories/Marketing";

// =======================
// 🔒 Protected Routes
// =======================

const ProtectedAdminRoute = ({ children }) => {
  const adminUser = localStorage.getItem("adminUser");
  if (!adminUser) return <Navigate to="/admin/login" replace />;
  return children;
};

const ProtectedUserRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Wait until useAuth finishes checking token
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600 text-lg">
        Checking authentication...
      </div>
    );
  }

  // If NOT logged in AFTER validation → redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


// =======================
// 🚀 Main App Component
// =======================

function App() {
  return (
    <ScrollToTop>
      <Routes>
        {/* ---------- Public Routes ---------- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/templates" element={<TemplateLibraryPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />


        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />

        {/* ---------- User Auth Routes ---------- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ---------- Protected User Routes ---------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedUserRoute>
              <DashboardPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedUserRoute>
              <Settings />
            </ProtectedUserRoute>
          }
        />

        {/* ---------- Category Routes ---------- */}
        <Route path="/categories/accounts" element={<AccountsPage />} />
        <Route path="/categories/hr" element={<HRPage />} />
        <Route path="/categories/legal" element={<LegalPage />} />
        <Route path="/categories/business" element={<BusinessPage />} />
        <Route path="/categories/marketing" element={<MarketingPage />} />

        {/* ---------- Admin Auth Routes ---------- */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ---------- Protected Admin Routes ---------- */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          }
        />

         {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminPage />} />


        {/* ---------- Legal Routes ---------- */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiesPolicy />} />

        {/* ---------- Extra ---------- */}
        <Route path="/contact-submissions" element={<ContactSubmissions />} />

        {/* ---------- Redirects ---------- */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* ---------- 404 Fallback ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ScrollToTop>
  );
}

export default App;
