import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, User, Clock, Eye, EyeOff, Trash2, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';

const ContactSubmissions = ({ contactSubmissions = [], onRefresh }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use passed submissions or load independently
  useEffect(() => {
    if (contactSubmissions && contactSubmissions.length > 0) {
      setSubmissions(contactSubmissions);
      setLoading(false);
    } else {
      loadSubmissions();
    }
  }, [contactSubmissions]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch(tab) {
      case 'users':
        navigate('/admin/users');
        break;
      case 'newsletter':
        navigate('/admin/newsletter');
        break;
      case 'analytics':
        navigate('/admin/analytics');
        break;
      case 'contact':
        navigate('/admin/contact-messages');
        break;
      case 'upload':
        navigate('/admin/upload');
        break;
      // default:
      //   navigate('/admin/dashboard');
    }
  };

  const loadSubmissions = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch('http://localhost:5001/api/contact/submissions');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success) {
        setSubmissions(result.submissions);
      } else {
        throw new Error(result.message || 'Failed to load submissions');
      }
    } catch (error) {
      console.error('Error loading contact submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact submissions',
        variant: 'destructive',
      });
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (id, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/contact/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSubmissions(prev =>
          prev.map(sub =>
            sub._id === id ? { ...sub, read: !currentStatus } : sub
          )
        );
        toast({
          title: 'Success',
          description: `Submission marked as ${!currentStatus ? 'read' : 'unread'}`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to update submission',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/contact/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSubmissions(prev => prev.filter(sub => sub._id !== id));
        // Refresh parent data if callback provided
        if (onRefresh) {
          onRefresh(true);
        }
        toast({
          title: 'Deleted',
          description: 'Contact submission deleted successfully',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete submission',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(true);
    } else {
      loadSubmissions(true);
    }
  };

  const unreadCount = submissions.filter(sub => !sub.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        <div className="flex-1 flex justify-center items-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Contact Messages - Admin Panel</title>
      </Helmet>

      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
        {/* <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} /> */}

        <div className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            {/* <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Contact Messages
                </h1>
                <p className="text-gray-600 text-lg">
                  {submissions.length} total submissions • {unreadCount} unread
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('adminUser');
                    navigate('/admin/login');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div> */}

            {/* Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-600">Contact form submissions will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact Info
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Message
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {submissions.map((submission) => (
            <tr 
              key={submission._id} 
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                {!submission.read ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    New
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Read
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{submission.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{submission.email}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="font-medium text-gray-900">{submission.subject}</span>
              </td>
              <td className="px-6 py-4 max-w-md">
                <div className="text-sm text-gray-700">
                  {submission.message && submission.message.length > 100 ? (
                    <>
                      <p className="line-clamp-2 mb-1">
                        {submission.message.substring(0, 100)}...
                      </p>
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800 text-xs">
                          Show full message
                        </summary>
                        <p className="mt-2 p-2 bg-gray-50 rounded text-gray-700 whitespace-pre-wrap">
                          {submission.message}
                        </p>
                      </details>
                    </>
                  ) : (
                    <p>{submission.message}</p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {new Date(submission.createdAt).toLocaleDateString()}
                  <span className="text-xs ml-1">
                    {new Date(submission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(submission._id, submission.read)}
                    className={`border ${
                      !submission.read 
                        ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200' 
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {submission.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(submission._id)}
                    className="border border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ContactSubmissions;