// src/pages/admin/components/AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Mail, 
  BarChart,
  FolderOpen,
  FolderTree,
  UserCheck,
  Settings,
  LogOut,
  Contact,
  ChevronRight,
  Building,
  Shield,
  RefreshCw,
  IndianRupee // Add this import
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get admin data from localStorage
  const adminData = JSON.parse(localStorage.getItem('adminUser') || '{}');

  // State for dynamic counts
  const [dynamicCounts, setDynamicCounts] = useState({
    users: 0,
    contactSubmissions: 0,
    newsletter: 0,
    templates: 0,
    categories: 0,
    subcategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch all dynamic data
  const fetchDynamicData = async () => {
    try {
      setRefreshing(true);
      const headers = getAuthHeaders();
      
      // Fetch users count
      try {
        const usersResponse = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setDynamicCounts(prev => ({ ...prev, users: usersData.users?.length || 0 }));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }

      // Fetch contact submissions count
      try {
        const contactResponse = await fetch(`${API_BASE_URL}/api/contact/submissions`, { headers });
        if (contactResponse.ok) {
          const contactData = await contactResponse.json();
          setDynamicCounts(prev => ({ ...prev, contactSubmissions: contactData.submissions?.length || 0 }));
        }
      } catch (error) {
        console.error('Error fetching contact submissions:', error);
      }

      // Fetch newsletter subscribers count
      try {
        const newsletterResponse = await fetch(`${API_BASE_URL}/api/newsletter/subscribers`, { headers });
        if (newsletterResponse.ok) {
          const newsletterData = await newsletterResponse.json();
          setDynamicCounts(prev => ({ ...prev, newsletter: newsletterData.subscribers?.length || 0 }));
        }
      } catch (error) {
        console.error('Error fetching newsletter:', error);
      }

      // Fetch templates count
      try {
        const templatesResponse = await fetch(`${API_BASE_URL}/api/admin/templates`, { headers });
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          setDynamicCounts(prev => ({ ...prev, templates: templatesData.templates?.length || 0 }));
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }

      // Fetch categories count
      try {
        const categoriesResponse = await fetch(`${API_BASE_URL}/api/admin/categories`, { headers });
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setDynamicCounts(prev => ({ ...prev, categories: categoriesData.categories?.length || 0 }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      // Fetch subcategories count
      try {
        const subcategoriesResponse = await fetch(`${API_BASE_URL}/api/admin/subcategories`, { headers });
        if (subcategoriesResponse.ok) {
          const subcategoriesData = await subcategoriesResponse.json();
          setDynamicCounts(prev => ({ ...prev, subcategories: subcategoriesData.subCategories?.length || 0 }));
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }

    } catch (error) {
      console.error('Error fetching dynamic data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Format numbers with K/M suffixes
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  // Load data on component mount
  useEffect(() => {
    fetchDynamicData();
  }, []);

  // Refresh data function
  const handleRefresh = () => {
    fetchDynamicData();
    toast({
      title: 'Refreshing Data',
      description: 'Fetching latest counts...',
    });
  };

  const navigationItems = [
    {
      name: 'Users',
      path: 'users',
      icon: Users,
      description: 'Manage registered users',
      badge: formatCount(dynamicCounts.users),
      count: dynamicCounts.users
    },
    {
      name: 'Contact Submissions',
      path: 'contact-submissions',
      icon: Contact,
      description: 'User contacts submission',
      badge: formatCount(dynamicCounts.contactSubmissions),
      count: dynamicCounts.contactSubmissions
    },
    {
      name: 'Newsletter',
      path: 'newsletter',
      icon: Mail,
      description: 'Manage subscribers',
      badge: formatCount(dynamicCounts.newsletter),
      count: dynamicCounts.newsletter
    },
    {
      name: 'Analytics',
      path: 'analytics',
      icon: BarChart,
      description: 'Platform analytics',
      badge: null,
      count: 0
    },
    {
      name: 'Pricing Manager', // Add this new item
      path: 'pricing-manager',
      icon: IndianRupee,
      description: 'Manage subscription plans',
      badge: null,
      count: 0
    },
    {
      name: 'Payment Manager', // Add this new item
      path: 'payment-manager',
      icon: IndianRupee,
      description: 'Manage payment plans',
      badge: null,
      count: 0
    },
    {
      type: 'divider',
      label: 'Content Management'
    },
    {
      name: 'Templates',
      path: 'templates',
      icon: FileText,
      description: 'Document templates',
      badge: formatCount(dynamicCounts.templates),
      count: dynamicCounts.templates
    },
    {
      name: 'Categories',
      path: 'categories',
      icon: FolderOpen,
      description: 'Main categories',
      badge: formatCount(dynamicCounts.categories),
      count: dynamicCounts.categories
    },
    {
      name: 'SubCategories',
      path: 'subcategories',
      icon: FolderTree,
      description: 'Subcategories',
      badge: formatCount(dynamicCounts.subcategories),
      count: dynamicCounts.subcategories
    },
    {
      name: 'User Access',
      path: 'user-access',
      icon: UserCheck,
      description: 'Access levels',
      badge: null,
      count: 0
    },
    
    // {
    //   type: 'divider',
    //   label: 'Settings'
    // },
    // {
    //   name: 'System Settings',
    //   path: 'settings',
    //   icon: Settings,
    //   description: 'System configuration',
    //   badge: null,
    //   count: 0
    // }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    toast({
      title: 'Logged out',
      description: 'You have been logged out from admin panel',
    });
    navigate('/admin/login');
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl border-r border-gray-700 sticky top-0 h-screen">
        {/* Header Skeleton */}
        <div className="p-6 border-b border-gray-700 bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
              <div className="w-24 h-3 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Navigation Skeleton */}
        <div className="flex-1 overflow-hidden py-4 space-y-2 px-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="w-full h-12 bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/30 flex-shrink-0">
          <div className="w-full h-16 bg-gray-700 rounded-lg animate-pulse mb-4"></div>
          <div className="w-full h-12 bg-gray-700 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl border-r border-gray-700 sticky top-0 h-screen">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-700 bg-gray-800/50 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-400 text-sm">StartupDocs Builder</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            <span>Administrator Access</span>
          </div>
          
        </div>
      </div>

      {/* Navigation - Hidden scrollbar */}
      <div className="flex-1 overflow-hidden">
        <nav className="h-full overflow-y-auto py-4 space-y-1 px-4 
          [&::-webkit-scrollbar]:w-0 
          [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-transparent
          [-ms-overflow-style:none]
          [scrollbar-width:none]">
          {navigationItems.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div key={index} className="pt-6 pb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                    {item.label}
                  </p>
                  <div className="mt-2 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = activeTab === item.path;

            return (
              <button
                key={item.path}
                onClick={() => setActiveTab(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-600/20 text-white border-l-4 border-blue-400 shadow-lg shadow-blue-500/10'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-l-4 hover:border-gray-500'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full" />
                )}
                
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-300'
                }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium block text-sm transition-all ${
                      isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'
                    }`}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className={`text-xs px-2 py-1 rounded-full min-w-8 text-center ${
                        isActive 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs block mt-0.5 transition-all ${
                    isActive ? 'text-blue-200' : 'text-gray-500 group-hover:text-gray-400'
                  }`}>
                    {item.description}
                  </span>
                </div>
                
                <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                  isActive ? 'text-blue-300 rotate-90' : 'text-gray-500 group-hover:text-gray-400'
                }`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Enhanced Footer with Dynamic Admin Data - Fixed at bottom */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/30 flex-shrink-0">
        {/* Admin Profile */}
        <div className="mb-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {adminData?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {adminData?.name || 'Administrator'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {adminData?.email || 'admin@startupdocs.com'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-200 border border-transparent hover:border-red-500/30 transition-all duration-200 group"
        >
          <div className="p-1.5 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
            <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300" />
          </div>
          <span className="font-medium flex-1 text-left">Logout</span>
          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Last Updated */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            {refreshing ? 'Refreshing...' : `Updated: ${new Date().toLocaleTimeString()}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;