import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import AdminSidebar from './admin/components/AdminSidebar'; // Updated import path
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import Templates from './Templates';
import UsersPage from './Users';
import Newsletter from './Newsletter';
import Analytics from './Analytics';
import Categories from './admin/Categories';
import SubCategories from './admin/SubCategories';
import UserAccess from './admin/UserAccess';
import FileTypes from './admin/FileTypes';
import GlobalSearch from './admin/components/GlobalSearch';

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check admin session
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      toast({
        title: 'Access Denied',
        description: 'Please login to access admin panel',
        variant: 'destructive',
      });
      navigate('/admin/login');
      return;
    }
  }, [navigate, toast]);

  // Sync activeTab with current URL
  useEffect(() => {
    const path = location.pathname;
    const tab = path.split('/').pop() || 'templates';
    setActiveTab(tab);
  }, [location.pathname]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  // Refresh function
  const refreshData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: 'Refreshed',
        description: 'Data updated successfully',
      });
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Admin Panel - StartupDocs Builder</title>
      </Helmet>

      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Use AdminSidebar from admin/components */}
        <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} />

        <div className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your platform content and settings
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={refreshData}
                  disabled={refreshing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Global Search */}
          <div className="mb-6">
            <GlobalSearch />
          </div>

          {/* Main Content */}
          <Routes>
            <Route path="templates" element={<Templates />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="categories" element={<Categories />} />
            <Route path="subcategories" element={<SubCategories />} />
            <Route path="user-access" element={<UserAccess />} />
            <Route path="file-types" element={<FileTypes />} />
            {/* Add settings route if needed */}
            <Route path="settings" element={
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
                <p className="text-gray-500">System settings will be implemented here.</p>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default AdminPage;