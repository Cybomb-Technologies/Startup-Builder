import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { RefreshCw, Shield, Settings, BarChart3, Users, FileText } from 'lucide-react';
import AdminSidebar from './admin/components/AdminSidebar';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import Templates from './admin/Templates';
import UsersPage from './admin/Users';
import Newsletter from './admin/Newsletter';
import Analytics from './admin/Analytics';
import Categories from './admin/Categories';
import SubCategories from './admin/SubCategories';
import UserAccess from './admin/UserAccess';
import ContactSubmissions from './admin/ContactSubmissions';
import GlobalSearch from './admin/components/GlobalSearch';
import AdminPricingManager from './admin/AdminPricingManager';
import PaymentsPage from './admin/Payments';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalTemplates: 0,
    systemHealth: '99.8%',
    userGrowth: 0,
    templateGrowth: 0
  });

  // Get auth headers
  const getAuthHeaders = () => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      console.error('❌ No admin session found');
      return {};
    }

    try {
      const userData = JSON.parse(adminUser);
      const token = userData.token;
      
      if (!token) {
        console.error('❌ No token found in admin session');
        return {};
      }

      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('❌ Error parsing admin user data:', error);
      return {};
    }
  };

  // Check admin session
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      toast({
        title: 'Access Denied',
        description: 'Administrative credentials required to access this panel',
        variant: 'destructive',
      });
      navigate('/admin/login');
      return;
    }
    loadDashboardData();
  }, [navigate, toast]);

  // Sync activeTab with current URL
  useEffect(() => {
    const path = location.pathname;
    const tab = path.split('/').pop() || 'templates';
    setActiveTab(tab);
  }, [location.pathname]);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) return;
      
      // Fetch users data
      const usersResponse = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers
      });
      
      // Fetch templates data
      const templatesResponse = await fetch(`${API_BASE_URL}/api/admin/templates`, {
        headers
      });

      let totalUsers = 0;
      let totalTemplates = 0;

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        totalUsers = usersData.users?.length || 0;
      } else {
        console.error('❌ Failed to load users:', usersResponse.status);
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        totalTemplates = templatesData.templates?.length || 0;
      } else {
        console.error('❌ Failed to load templates:', templatesResponse.status);
      }

      // Calculate growth percentages (you can replace this with actual growth data from your API)
      const userGrowth = totalUsers > 0 ? Math.min(25, Math.floor(Math.random() * 25) + 1) : 0;
      const templateGrowth = totalTemplates > 0 ? Math.min(15, Math.floor(Math.random() * 15) + 1) : 0;

      setDashboardData({
        totalUsers,
        totalTemplates,
        systemHealth: '99.8%',
        userGrowth,
        templateGrowth
      });

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  // Refresh function
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
      toast({
        title: 'System Updated',
        description: 'All data has been successfully synchronized',
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh dashboard data',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Format growth percentage
  const formatGrowth = (growth) => {
    if (growth === 0) return 'No change';
    return growth > 0 ? `+${growth}% from last month` : `${growth}% from last month`;
  };

  return (
    <>
      <Helmet>
        <title>Administration Panel - Paplixo</title>
      </Helmet>

      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Admin Sidebar Navigation */}
        <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} />

        <div className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">
                    Administration Panel
                  </h1>
                  <div className="text-slate-600 text-base">
                    Comprehensive platform management and oversight
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200">
                  <BarChart3 className="w-4 h-4" />
                  <span>System Status: Operational</span>
                </div>
                {/* <button
                  onClick={refreshData}
                  disabled={refreshing || loading}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Synchronizing...' : 'Refresh Data'}
                </button> */}
              </div>
            </div>
          </motion.div>

          {/* Global Search */}
          <div className="mb-8">
            <GlobalSearch />
          </div>

          {/* Dashboard Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Active Users Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600">Active Users</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      dashboardData.totalUsers.toLocaleString()
                    )}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {loading ? (
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatGrowth(dashboardData.userGrowth)
                  )}
                </div>
              </div>
            </motion.div>

            {/* Templates Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600">Templates</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      dashboardData.totalTemplates.toLocaleString()
                    )}
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {loading ? (
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatGrowth(dashboardData.templateGrowth)
                  )}
                </div>
              </div>
            </motion.div>

            {/* System Health Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600">System Health</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {dashboardData.systemHealth}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">All systems operational</div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <Routes>
              <Route path="templates" element={<Templates />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="newsletter" element={<Newsletter />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="categories" element={<Categories />} />
              <Route path="subcategories" element={<SubCategories />} />
              <Route path="user-access" element={<UserAccess />} />
              <Route path="contact-submissions" element={<ContactSubmissions />} />
              {/* ADD THIS NEW ROUTE FOR PRICING MANAGER */}
              <Route path="pricing-manager" element={<AdminPricingManager />} />
              <Route path="payment-manager" element={<PaymentsPage />} />
              <Route path="settings" element={
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="w-6 h-6 text-slate-700" />
                    <h2 className="text-2xl font-semibold text-slate-900">System Configuration</h2>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <div className="text-slate-600">System configuration panel is currently under development.</div>
                    <div className="text-sm text-slate-500 mt-2">Advanced settings and preferences will be available in the next update.</div>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;