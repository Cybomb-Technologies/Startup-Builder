// ✅ Your existing imports stay the same
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, FileText, Mail, LogOut, RefreshCw, MessageSquare } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import Templates from './Templates';
import UsersPage from './Users';
import Newsletter from './Newsletter';
import Analytics from './Analytics';
import ContactSubmissions from './ContactSubmissions';

const AdminPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [templates, setTemplates] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Check admin session
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
  }, [toast, navigate]);

  // ✅ Keep all your existing tab syncing logic
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/templates')) setActiveTab('templates');
    else if (path.includes('/admin/users')) setActiveTab('users');
    else if (path.includes('/admin/newsletter')) setActiveTab('newsletter');
    else if (path.includes('/admin/analytics')) setActiveTab('analytics');
    else if (path.includes('/admin/contact-messages')) setActiveTab('contact-messages');
    else if (path.includes('/admin/upload')) setActiveTab('upload');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'dashboard':
        navigate('/admin/dashboard');
        break;
      case 'templates':
        navigate('/admin/templates');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'newsletter':
        navigate('/admin/newsletter');
        break;
      case 'analytics':
        navigate('/admin/analytics');
        break;
      case 'contact-messages':
        navigate('/admin/contact-messages');
        break;
      case 'upload':
        navigate('/admin/upload');
        break;
      default:
        navigate('/admin/dashboard');
    }
  };

  const handleStatClick = (label) => {
    switch (label) {
      case 'Total Templates':
        handleTabChange('templates');
        break;
      case 'Registered Users':
        handleTabChange('users');
        break;
      case 'Newsletter Subscribers':
        handleTabChange('newsletter');
        break;
      case 'Contact Messages':
        handleTabChange('contact-messages');
        break;
      default:
        break;
    }
  };

  // ✅ Load REAL contact submissions (unchanged)
  const loadContactSubmissions = async () => {
    const response = await fetch('http://localhost:5001/api/contact/submissions');
    const result = await response.json();
    if (result.success && Array.isArray(result.submissions)) setContactSubmissions(result.submissions);
  };

  // ✅ ✅ UPDATED — Fetch Registered Users with Admin Token
  const loadRegisteredUsers = async () => {
    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser'));
      const token = adminUser?.token;

      if (!token) {
        console.warn('No admin token found. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:5001/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ include token
        },
      });

      const result = await response.json();

      if (response.ok && result.success && Array.isArray(result.users)) {
        setRegisteredUsers(result.users);
        console.log(`✅ Loaded ${result.users.length} registered users`);
      } else {
        console.error('Failed to load users:', result.message);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // ✅ Load REAL newsletter subscribers (unchanged)
  const loadNewsletterSubscribers = async () => {
    const response = await fetch('http://localhost:5001/api/admin/newsletter-subscribers');
    const result = await response.json();
    if (result.success && Array.isArray(result.subscribers)) setNewsletterSubscribers(result.subscribers);
  };

  // ✅ Load REAL templates (unchanged)
  const loadTemplates = async () => {
    const response = await fetch('http://localhost:5001/api/admin/templates');
    const result = await response.json();
    if (result.success && Array.isArray(result.templates)) setTemplates(result.templates);
  };

  // ✅ Load all REAL data (unchanged)
  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      await Promise.all([
        loadContactSubmissions(),
        loadRegisteredUsers(),
        loadNewsletterSubscribers(),
        loadTemplates(),
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      if (isRefresh) {
        setRefreshing(false);
        toast({ title: 'Refreshed', description: 'Data updated successfully' });
      } else setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // ✅ Compute Stats (this will now show real registered user count)
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
      label: "Contact Messages",
      value: contactSubmissions?.length || 0,
      icon: MessageSquare,
      description: "Contact form submissions",
    },
  ];

  const renderCurrentTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'templates':
        return <Templates templates={templates} onRefresh={loadData} />;
      case 'users':
        return <UsersPage registeredUsers={registeredUsers} onRefresh={loadData} />;
      case 'newsletter':
        return <Newsletter newsletterSubscribers={newsletterSubscribers} onRefresh={loadData} />;
      case 'analytics':
        return <Analytics />;
      case 'contact-messages':
        return <ContactSubmissions contactSubmissions={contactSubmissions} onRefresh={loadData} />;
      case 'upload':
        return <div className="p-6">Upload Templates Page</div>;
      default:
        return <Templates templates={templates} onRefresh={loadData} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Panel - StartupDocs Builder</title>
      </Helmet>

      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

        <div className="flex-1 p-8 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-lg">Manage templates, users, and performance</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('adminUser');
                    navigate('/admin/login');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>

                <button
                  onClick={() => loadData(true)}
                  disabled={refreshing || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* ✅ Stats cards - show real user count now */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleStatClick(stat.label)}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
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

          {/* ✅ Main Content */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {renderCurrentTabContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
