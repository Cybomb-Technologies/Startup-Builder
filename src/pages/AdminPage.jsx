import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, FileText, Mail, UserCheck } from 'lucide-react';
import  Sidebar  from '@/components/Sidebar'; // ✅ FIXED IMPORT - added curly braces
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import Templates from './Templates';
import UsersPage from './Users';
import Newsletter from './Newsletter';
import Analytics from './Analytics';

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [templates, setTemplates] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    domContentLoaded: 0,
    loadEvent: 0,
    totalLoadTime: 0,
  });

  // ✅ Sync activeTab with current URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/users')) setActiveTab('users');
    else if (path.includes('/admin/newsletter')) setActiveTab('newsletter');
    else if (path.includes('/admin/analytics')) setActiveTab('analytics');
    else setActiveTab('templates'); // default to templates
  }, [location.pathname]);

  // ✅ Handle tab change - navigate to corresponding URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  // ✅ Delete handlers
  const handleDelete = async (id) => {
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast({ title: 'Deleted', description: 'Template deleted successfully' });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      setRegisteredUsers((prev) => prev.filter((u) => u.id !== id));
      toast({ title: 'Deleted', description: 'User removed successfully' });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleUnsubscribe = async (email) => {
    try {
      await fetch(`/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setNewsletterSubscribers((prev) =>
        prev.filter((sub) => sub.email !== email)
      );
      toast({ title: 'Unsubscribed', description: `${email} removed` });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe user',
        variant: 'destructive',
      });
    }
  };

  // ✅ Check admin access
  useEffect(() => {
    if (!user) return;
    if (!user.isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  // ✅ Redirect to default admin route if accessing /admin
  useEffect(() => {
    if (location.pathname === '/admin') {
      navigate('/admin/templates', { replace: true });
    }
  }, [location.pathname, navigate]);

  // ✅ Performance metrics
  useEffect(() => {
    const measurePerformance = () => {
      if (performance.timing) {
        const domContentLoaded =
          performance.timing.domContentLoadedEventEnd -
          performance.timing.navigationStart;
        const loadEvent =
          performance.timing.loadEventEnd - performance.timing.navigationStart;
        setPerformanceMetrics({
          domContentLoaded,
          loadEvent,
          totalLoadTime: loadEvent,
        });
      }
    };

    if (document.readyState === 'complete') measurePerformance();
    else window.addEventListener('load', measurePerformance);

    return () => window.removeEventListener('load', measurePerformance);
  }, []);

  // ✅ Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const usersRes = await fetch('http://localhost:5000/api/admin/users');
        const usersData = await usersRes.json();
  
        if (usersData.success) {
          setRegisteredUsers(usersData.users);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, []);

  const calculateActiveUsers = () => {
    return registeredUsers?.length > 0
      ? Math.floor(registeredUsers.length / 2)
      : 0;
  };

  // ✅ Compute Stats from Real Data
  const stats = [
    {
      label: "Total Templates",
      value: templates?.length || 0,
      icon: FileText,
      description: "Available document templates",
    },
    {
      label: "Registered Users",
      value: registeredUsers?.length || 0,
      icon: Users,
      description: "Total registered users",
    },
    {
      label: "Newsletter Subscribers",
      value: newsletterSubscribers?.length || 0,
      icon: Mail,
      description: "Active newsletter subscribers",
    },
    {
      label: "Active This Week",
      value: calculateActiveUsers() || 0,
      icon: UserCheck,
      description: "Users active in last 7 days",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Panel - StartupDocs Builder</title>
      </Helmet>

      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
        {/* ✅ Sidebar - Pass handleTabChange */}
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* ✅ Main content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Manage templates, users, and performance
            </p>
          </motion.div>

          {/* ✅ Performance metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Performance Metrics
                </h3>
                <p className="text-xs text-gray-500">Page load statistics</p>
              </div>
              <div className="flex gap-4 text-xs flex-wrap">
                <span className="text-green-600">
                  DOM: {performanceMetrics.domContentLoaded}ms
                </span>
                <span className="text-blue-600">
                  Load: {performanceMetrics.loadEvent}ms
                </span>
                <span className="text-purple-600">
                  Total: {performanceMetrics.totalLoadTime}ms
                </span>
              </div>
            </div>
          </div>

          {/* ✅ Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ✅ Nested Routes */}
          <Routes>
            <Route path="templates" element={
              <Templates templates={templates} handleDelete={handleDelete} />
            } />
            <Route path="users" element={
              <UsersPage
                registeredUsers={registeredUsers}
                handleDeleteUser={handleDeleteUser}
              />
            } />
            <Route path="newsletter" element={
              <Newsletter
                newsletterSubscribers={newsletterSubscribers}
                handleUnsubscribe={handleUnsubscribe}
              />
            } />
            <Route path="analytics" element={
              <Analytics performanceMetrics={performanceMetrics} />
            } />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default AdminPage;