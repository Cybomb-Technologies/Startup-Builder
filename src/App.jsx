import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ScrollToTop from "./components/ScrollToTop";
import { useAuth } from "@/hooks/useAuth";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ===== User Pages =====
import HomePage from "./pages/Home/HomePage";
import TemplateLibraryPage from "@/pages/TemplateLibraryPage";
import EditorPage from "@/pages/EditorPage";
import PricingPage from "@/pages/PricingPage";
import CheckoutPage from "@/pages/CheckoutPage"; 
import DashboardPage from "@/pages/DashboardPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";
import Settings from "./pages/Settings";
import PricingPolicy from './pages/PricingPolicy';
import PaymentResult from './pages/PaymentResult';

// ===== Auth Pages =====
import ForgotPassword from "@/pages/ForgotPassword";
import VerifyOtp from "@/pages/VerifyOtp";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

// ===== Admin Pages =====
import AdminPage from "@/pages/AdminPage";
import AdminLoginPage from "@/pages/AdminLogin";
import AdminUploadPage from "@/pages/AdminUploadPage";
import ContactSubmissions from "./pages/admin/ContactSubmissions";

// ===== Legal Pages =====
import PrivacyPolicy from "@/components/PrivacyPolicy";
import TermsOfService from "@/components/TermsPage";
import CookiesPolicy from "@/components/CookiesPolicy";

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
  const location = useLocation();
  
  // Check if current route should hide navbar and footer
  const isEditorPage = location.pathname.startsWith('/editor/');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isCheckoutPage = location.pathname.startsWith('/checkout'); // ADD THIS
  
  return (
    <ScrollToTop>
      {/* Conditionally render Navbar - hide on editor pages, admin pages, and checkout pages */}
      {!isEditorPage && !isAdminPage && !isCheckoutPage && <Navbar />}
      
      <Routes>
        {/* ---------- Public Routes ---------- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/templates" element={<TemplateLibraryPage />} />
        
        {/* Editor routes - no header/footer */}
        <Route path="/editor/userdoc/:id" element={<EditorPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />

        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/pricing-policy" element={<PricingPolicy />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/payment/result" element={<PaymentResult />} />

        {/* ---------- Checkout Route ---------- */}
        <Route 
          path="/checkout/:planId" 
          element={
            <ProtectedUserRoute>
              <CheckoutPage />
            </ProtectedUserRoute>
          } 
        />

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
        <Route path="/pricing-policy" element={<PricingPolicy />} />

        {/* ---------- Extra ---------- */}
        <Route path="/contact-submissions" element={<ContactSubmissions />} />

        {/* ---------- Redirects ---------- */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* ---------- 404 Fallback ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Conditionally render Footer - hide on editor pages, admin pages, and checkout pages */}
      {!isEditorPage && !isAdminPage && !isCheckoutPage && <Footer />}
    </ScrollToTop>
  );
}

export default App;