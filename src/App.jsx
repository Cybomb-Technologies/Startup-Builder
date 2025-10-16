
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import TemplateLibraryPage from '@/pages/TemplateLibraryPage';
import EditorPage from '@/pages/EditorPage';
import PricingPage from '@/pages/PricingPage';
import DashboardPage from '@/pages/DashboardPage';
import AdminPage from '@/pages/AdminPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import BlogPage from '@/pages/BlogPage';
import LoginPage from '@/pages/LoginPage';
import AdminUploadPage from '@/pages/AdminUploadPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/templates" element={<TemplateLibraryPage />} />
      <Route path="/editor/:id" element={<EditorPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/upload" element={<AdminUploadPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
  