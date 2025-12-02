// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  FolderOpen, 
  Download, 
  Clock, 
  Edit, 
  Share, 
  RefreshCw,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Users,
  BarChart,
  Globe,
  Shield,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    projects: 0
  });
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingDocument, setCreatingDocument] = useState(false);
  const [billingData, setBillingData] = useState({
    planName: 'Free',
    billingCycle: 'monthly',
    subscriptionStatus: 'inactive',
    planExpiry: null,
    nextPayment: null,
    invoicesCount: 0,
    totalSpent: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user data including billing
  const fetchUserData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch all data in parallel
      const [documentsResponse, statsResponse, billingResponse] = await Promise.all([
        fetch('http://localhost:5000/api/users/documents', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/users/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/payments/plan-details', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        const templateDocuments = documentsData.documents || [];
        setRecentTemplates(templateDocuments);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || {
          totalDocuments: 0,
          projects: 0
        });
      }

      if (billingResponse.ok) {
        const billingData = await billingResponse.json();
        if (billingData.success) {
          setBillingData({
            planName: billingData.user?.planName || 'Free',
            billingCycle: billingData.user?.billingCycle || 'monthly',
            subscriptionStatus: billingData.user?.subscriptionStatus || 'inactive',
            planExpiry: billingData.user?.planExpiryDate || null,
            nextPayment: billingData.user?.nextPaymentDate || null,
            invoicesCount: billingData.paymentDetails ? 1 : 0,
            totalSpent: billingData.paymentDetails?.amount || 0
          });
        }
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [isAuthenticated]);

  // Listen for template download/edit events to refresh data
  useEffect(() => {
    const handleTemplateAction = () => {
      fetchUserData();
    };

    window.addEventListener('templateDownloaded', handleTemplateAction);
    window.addEventListener('templateEdited', handleTemplateAction);
    
    return () => {
      window.removeEventListener('templateDownloaded', handleTemplateAction);
      window.removeEventListener('templateEdited', handleTemplateAction);
    };
  }, []);

  // Handle new document creation
  const handleNewDocument = async () => {
    try {
      setCreatingDocument(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in to create a new document');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/editor/new/config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/editor/userdoc/${data.documentId}`);
      } else {
        const errorData = await response.json();
        
        if (response.status === 401) {
          alert('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          alert(errorData.message || 'Failed to create new document. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating new document:', error);
      alert('Error creating new document. Please try again.');
    } finally {
      setCreatingDocument(false);
    }
  };

  const handleEditTemplate = (documentId) => {
    navigate(`/editor/userdoc/${documentId}`);
  };

  const handleBrowseTemplates = () => {
    navigate('/templates');
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '$0.00';
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    }
  };

  // Plan features based on current plan
  const getPlanFeatures = () => {
    const baseFeatures = [
      { icon: <Zap className="h-4 w-4 text-blue-500" />, text: "Basic Templates" },
      { icon: <Users className="h-4 w-4 text-green-500" />, text: "Single User" },
    ];

    if (billingData.planName.toLowerCase().includes('pro') || billingData.planName.toLowerCase().includes('premium')) {
      return [
        ...baseFeatures,
        { icon: <BarChart className="h-4 w-4 text-purple-500" />, text: "Advanced Analytics" },
        { icon: <Globe className="h-4 w-4 text-orange-500" />, text: "Priority Support" },
        { icon: <Shield className="h-4 w-4 text-red-500" />, text: "Enhanced Security" },
        { icon: <Lock className="h-4 w-4 text-indigo-500" />, text: "Team Collaboration" },
      ];
    }

    if (billingData.planName.toLowerCase().includes('business')) {
      return [
        ...baseFeatures,
        { icon: <BarChart className="h-4 w-4 text-purple-500" />, text: "Advanced Analytics" },
        { icon: <Globe className="h-4 w-4 text-orange-500" />, text: "Priority Support" },
        { icon: <Shield className="h-4 w-4 text-red-500" />, text: "Enhanced Security" },
        { icon: <Lock className="h-4 w-4 text-indigo-500" />, text: "Team Collaboration" },
        { icon: <Download className="h-4 w-4 text-green-500" />, text: "Unlimited Downloads" },
      ];
    }

    return baseFeatures;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access dashboard</h2>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || user?.email}!
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Quick Stats Grid - Including Billing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Templates Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 mr-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalDocuments}</p>
            </div>
          </div>
        </div>

        {/* Projects Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 mr-4">
              <FolderOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.projects}</p>
            </div>
          </div>
        </div>

        {/* Billing Status Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 mr-4">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Current Plan</p>
              <p className="text-2xl font-bold text-gray-900">{billingData.planName}</p>
            </div>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${
              billingData.subscriptionStatus === 'active' 
                ? 'bg-green-50' 
                : billingData.subscriptionStatus === 'expired'
                ? 'bg-red-50'
                : 'bg-yellow-50'
            }`}>
              {billingData.subscriptionStatus === 'active' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : billingData.subscriptionStatus === 'expired' ? (
                <AlertCircle className="w-6 h-6 text-red-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className={`text-2xl font-bold capitalize ${
                billingData.subscriptionStatus === 'active' 
                  ? 'text-green-600' 
                  : billingData.subscriptionStatus === 'expired'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {billingData.subscriptionStatus || 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & Billing Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={handleNewDocument}
                disabled={creatingDocument}
                className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingDocument ? (
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                ) : (
                  <Plus className="w-5 h-5 text-blue-600 mr-3" />
                )}
                <span className="font-medium text-gray-700">
                  {creatingDocument ? 'Creating...' : 'New Document'}
                </span>
              </button>
              <button 
                onClick={handleBrowseTemplates}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FolderOpen className="w-5 h-5 text-gray-600 mr-3" />
                <span className="font-medium text-gray-700">Browse Templates</span>
              </button>
              <button 
                onClick={() => navigate('/billing')}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                <span className="font-medium text-gray-700">Billing & Subscription</span>
              </button>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Billing Summary</h2>
              <Button
                onClick={() => navigate('/billing')}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Current Plan */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold">{billingData.planName}</span>
              </div>
              
              {/* Billing Cycle */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Billing:</span>
                <span className="font-semibold capitalize">{billingData.billingCycle}</span>
              </div>
              
              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold capitalize ${
                  billingData.subscriptionStatus === 'active' 
                    ? 'text-green-600' 
                    : 'text-gray-600'
                }`}>
                  {billingData.subscriptionStatus || 'Inactive'}
                </span>
              </div>
              
              {/* Expiry/Renewal Date */}
              {billingData.planExpiry && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {billingData.subscriptionStatus === 'active' ? 'Renews on:' : 'Expired on:'}
                  </span>
                  <span className="font-semibold">
                    {new Date(billingData.planExpiry).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {/* Total Spent */}
              {billingData.totalSpent > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Spent:</span>
                  <span className="font-semibold">
                    {formatCurrency(billingData.totalSpent)}
                  </span>
                </div>
              )}
              
              {/* Action Button */}
              {billingData.subscriptionStatus === 'active' ? (
                <Button 
                  onClick={() => navigate('/billing/settings')}
                  className="w-full mt-4"
                >
                  Manage Subscription
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/pricing')}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Recent Templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Templates Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Templates</h2>
              {recentTemplates.length > 0 && (
                <button 
                  onClick={handleBrowseTemplates}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Browse More
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-300 mr-3" />
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-12 h-8 bg-gray-200 rounded"></div>
                      <div className="w-12 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTemplates.length > 0 ? (
              <div className="space-y-4">
                {recentTemplates.slice(0, 5).map((template) => (
                  <div key={template._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Updated {formatDate(template.updatedAt)}
                        </p>
                        {template.originalTemplate && (
                          <p className="text-xs text-gray-400 mt-1">
                            Based on: {template.originalTemplate.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditTemplate(template._id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors flex items-center">
                        <Share className="w-3 h-3 mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No templates yet</p>
                <p className="text-sm text-gray-400 mt-1">Edit a template online to see it here</p>
                <button 
                  onClick={handleBrowseTemplates}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Templates
                </button>
              </div>
            )}
          </div>

          {/* Plan Features Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your {billingData.planName} Plan Features
              </h2>
              {billingData.planName === 'Free' && (
                <Button
                  onClick={() => navigate('/pricing')}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getPlanFeatures().map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {feature.icon}
                  </div>
                  <span className="font-medium text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Upgrade Prompt for Free Users */}
            {billingData.planName === 'Free' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Ready to level up?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Upgrade to unlock premium features, priority support, and unlimited templates.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/pricing')}
                  className="w-full mt-4"
                >
                  Explore Premium Plans
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;