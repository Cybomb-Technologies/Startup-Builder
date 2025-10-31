import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LogOut, RefreshCw, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

import AdminSidebar from './admin/components/AdminSidebar';
import Templates from './Templates';
import UsersPage from './Users';
import Newsletter from './Newsletter';
import Analytics from './Analytics';
import Categories from './admin/Categories';
import SubCategories from './admin/SubCategories';
import UserAccess from './admin/UserAccess';
import FileTypes from './admin/Contacts';
import GlobalSearch from './admin/components/GlobalSearch';
import ContactSubmissions from './ContactSubmissions';

const AdminPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    templates: 0,
    users: 0,
    newsletter: 0,
    contact: 0,
  });

  // ✅ Session check
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      toast({
        title: 'Access Denied',
        description: 'Please login to access admin panel',
        variant: 'destructive',
      });
      navigate('/admin/login');
    }
  }, [toast, navigate]);

  // ✅ Active tab sync
  useEffect(() => {
    const path = location.pathname;
    const tab = path.split('/').pop() || 'dashboard';
    setActiveTab(tab);
  }, [location.pathname]);

  // ✅ Refresh stats
  const refreshData = async () => {
    setRefreshing(true);
    try {
      const [usersRes, templatesRes, newsletterRes, contactRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users'),
        fetch('http://localhost:5000/api/admin/templates'),
        fetch('http://localhost:5000/api/admin/newsletter-subscribers'),
        fetch('http://localhost:5000/api/contact/submissions'),
      ]);

      const users = await usersRes.json();
      const templates = await templatesRes.json();
      const newsletter = await newsletterRes.json();
      const contact = await contactRes.json();

      setStats({
        templates: templates?.templates?.length || 0,
        users: users?.users?.length || 0,
        newsletter: newsletter?.subscribers?.length || 0,
        contact: contact?.submissions?.length || 0,
      });

      toast({ title: 'Refreshed', description: 'Data updated successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - StartupDocs Builder</title>
      </Helmet>

      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
        <AdminSidebar activeTab={activeTab} setActiveTab={(tab) => navigate(`/admin/${tab}`)} />

        <div className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-lg">Manage templates, users, and system data</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={refreshData}
                  disabled={refreshing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('adminUser');
                    navigate('/admin/login');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Stats */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Templates', value: stats.templates },
                { label: 'Registered Users', value: stats.users },
                { label: 'Newsletter Subscribers', value: stats.newsletter },
                { label: 'Contact Messages', value: stats.contact, icon: MessageSquare },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transform hover:scale-105 cursor-pointer"
                >
                  <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
                  <p className="text-3xl font-bold text-blue-700 mt-2">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Global Search */}
          {activeTab !== 'dashboard' && (
            <div className="mb-6">
              <GlobalSearch />
            </div>
          )}

          {/* Route-based content */}
          <Routes>
            <Route path="dashboard" element={<div className="bg-white rounded-lg shadow p-6">Welcome to Admin Dashboard</div>} />
            <Route path="templates" element={<Templates />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="categories" element={<Categories />} />
            <Route path="subcategories" element={<SubCategories />} />
            <Route path="user-access" element={<UserAccess />} />
            <Route path="file-types" element={<FileTypes />} />
            <Route path="contact-messages" element={<ContactSubmissions />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
