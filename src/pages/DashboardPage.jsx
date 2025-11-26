// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, FolderOpen, Download, Clock, Edit, Share, RefreshCw } from 'lucide-react';

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user data
  const fetchUserData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch user documents and stats in parallel
      const [documentsResponse, statsResponse] = await Promise.all([
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
        })
      ]);

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        // Only show template-based documents
        const templateDocuments = documentsData.documents || [];
        setRecentTemplates(templateDocuments);
      } else {
        console.error('Failed to fetch documents');
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || {
          totalDocuments: 0,
          projects: 0
        });
      } else {
        console.error('Failed to fetch stats');
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
      console.log('Template action detected, refreshing dashboard data...');
      fetchUserData();
    };

    // Add event listeners for template actions
    window.addEventListener('templateDownloaded', handleTemplateAction);
    window.addEventListener('templateEdited', handleTemplateAction);
    
    return () => {
      window.removeEventListener('templateDownloaded', handleTemplateAction);
      window.removeEventListener('templateEdited', handleTemplateAction);
    };
  }, []);

  // Simple card component
  const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, color = 'blue' }) => (
    <Card>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color === 'blue' ? 'bg-blue-50' : color === 'green' ? 'bg-green-50' : 'bg-purple-50'} mr-4`}>
          <Icon className={`w-6 h-6 ${color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : 'text-purple-600'}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
        </div>
      </div>
    </Card>
  );

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

      // Use the editor route to create a new empty document
      const response = await fetch('http://localhost:5000/api/editor/new/config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to editor with the new document
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

  // Handle edit template
  const handleEditTemplate = (documentId) => {
    navigate(`/editor/userdoc/${documentId}`);
  };

  // Handle browse templates
  const handleBrowseTemplates = () => {
    navigate('/templates');
  };

  // Handle refresh data
  const handleRefresh = () => {
    fetchUserData();
  };

  // Format date for display
  const formatDate = (dateString) => {
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

      {/* Quick Stats - HIDING DOWNLOADS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard 
          icon={FileText} 
          title="Total Templates" 
          value={stats.totalDocuments} 
          color="blue" 
        />
        <StatCard 
          icon={FolderOpen} 
          title="Projects" 
          value={stats.projects} 
          color="green" 
        />
        {/* Downloads card removed as requested */}
      </div>

      {/* Quick Actions & Recent Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
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
          </div>
        </Card>

        {/* Recent Templates */}
        <Card className="lg:col-span-2">
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
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;