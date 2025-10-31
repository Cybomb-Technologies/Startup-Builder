import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Clock, Eye, EyeOff, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Auth functions directly in the component
const getAdminToken = () => {
  const token = localStorage.getItem('adminToken');
  if (token && token.startsWith('eyJ') && token.length > 100) {
    return token;
  }
  return null;
};

const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

const validateAdminSession = () => {
  const token = getAdminToken();
  const adminUser = localStorage.getItem('adminUser');
  if (!token || !adminUser) {
    adminLogout();
    return false;
  }
  return true;
};

const ContactSubmissions = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Get auth headers with validation
  const getAuthHeaders = () => {
    // Validate session first
    if (!validateAdminSession()) {
      return {};
    }

    const token = getAdminToken();
    
    if (!token) {
      console.error('❌ No valid admin token found');
      toast({
        title: 'Authentication Required',
        description: 'Please login to continue',
        variant: 'destructive',
      });
      setTimeout(() => {
        adminLogout();
      }, 2000);
      return {};
    }
    
    console.log('🔐 Using token for API request');
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Load submissions from API
  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      // Check if headers are empty (no token)
      if (Object.keys(headers).length === 0) {
        setLoading(false);
        return;
      }

      console.log('📡 Loading contact submissions from API...');
      
      const response = await fetch('http://localhost:5001/api/contact/submissions', {
        headers
      });
      
      console.log('📡 Contact submissions API Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
        console.log('✅ Contact submissions loaded successfully:', data.submissions.length);
      } else if (response.status === 401) {
        console.log('❌ Unauthorized - clearing session');
        adminLogout();
        throw new Error('Session expired, please login again');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load contact submissions');
      }
    } catch (error) {
      console.error('❌ Error loading contact submissions:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, currentStatus) => {
    try {
      const headers = getAuthHeaders();
      
      // Check if headers are empty (no token)
      if (Object.keys(headers).length === 0) {
        return;
      }

      console.log('📤 Updating submission status:', id);
      
      const response = await fetch(`http://localhost:5001/api/contact/${id}/read`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ read: !currentStatus }),
      });

      console.log('📡 Update submission response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(prev =>
          prev.map(sub =>
            sub._id === id ? { ...sub, read: !currentStatus } : sub
          )
        );
        toast({
          title: 'Success',
          description: `Submission marked as ${!currentStatus ? 'read' : 'unread'}`,
        });
        console.log('✅ Submission status updated:', data);
      } else if (response.status === 401) {
        adminLogout();
        throw new Error('Session expired, please login again');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update submission');
      }
    } catch (error) {
      console.error('❌ Error updating submission:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) return;

    try {
      const headers = getAuthHeaders();
      
      // Check if headers are empty (no token)
      if (Object.keys(headers).length === 0) {
        return;
      }

      console.log('🗑️ Deleting submission:', id);
      
      const response = await fetch(`http://localhost:5001/api/contact/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log('📡 Delete submission response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(prev => prev.filter(sub => sub._id !== id));
        if (selectedSubmission && selectedSubmission._id === id) {
          setSelectedSubmission(null);
        }
        toast({
          title: 'Deleted',
          description: 'Contact submission deleted successfully',
        });
        console.log('✅ Submission deleted:', data);
      } else if (response.status === 401) {
        adminLogout();
        throw new Error('Session expired, please login again');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete submission');
      }
    } catch (error) {
      console.error('❌ Error deleting submission:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const unreadCount = submissions.filter(sub => !sub.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Contact Submissions ({submissions.length})
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full ml-2">
              {unreadCount} unread
            </span>
          )}
        </h2>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No contact submissions found</p>
            <p className="text-sm">Contact form submissions will appear here</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <div
              key={submission._id}
              className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                !submission.read ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-2 rounded-lg ${
                  !submission.read ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Mail className={`w-4 h-4 ${
                    !submission.read ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-gray-900">{submission.name}</span>
                    {!submission.read && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{submission.email}</p>
                  <p className="text-sm font-medium text-gray-900 mb-1">{submission.subject}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {submission.message}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Clock className="w-3 h-3" />
                    {new Date(submission.createdAt).toLocaleDateString()} at{' '}
                    {new Date(submission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
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
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(submission._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ContactSubmissions;