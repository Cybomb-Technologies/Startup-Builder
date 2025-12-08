import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  User, 
  Clock, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Download, 
  Filter, 
  Search, 
  Flag,
  Calendar,
  Phone,
  MapPin,
  FileText,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  if (!token) {
    adminLogout();
    return false;
  }
  return true;
};

const ContactSubmissions = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exportLoading, setExportLoading] = useState(false);
  const [showFlagDropdown, setShowFlagDropdown] = useState(false);

  // Get auth headers with validation
  const getAuthHeaders = () => {
    if (!validateAdminSession()) {
      return {};
    }

    const token = getAdminToken();
    
    if (!token) {
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
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Load submissions from API
  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      if (Object.keys(headers).length === 0) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/contact/submissions`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } else if (response.status === 401) {
        adminLogout();
        throw new Error('Session expired, please login again');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load contact submissions');
      }
    } catch (error) {
      console.error('Error loading contact submissions:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = submissions.filter(submission =>
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter === 'unread') {
      filtered = filtered.filter(sub => !sub.read);
    } else if (statusFilter === 'read') {
      filtered = filtered.filter(sub => sub.read);
    } else if (statusFilter === 'flagged') {
      filtered = filtered.filter(sub => sub.flag);
    }

    setFilteredSubmissions(filtered);
  };

  const handleMarkAsRead = async (id, currentStatus) => {
    try {
      const headers = getAuthHeaders();
      
      if (Object.keys(headers).length === 0) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/contact/${id}/read`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ read: !currentStatus }),
      });
      
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
      } else if (response.status === 401) {
        adminLogout();
        throw new Error('Session expired, please login again');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update submission');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFlagSubmission = async (id, flagType) => {
    try {
      const headers = getAuthHeaders();
      
      if (Object.keys(headers).length === 0) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/contact/${id}/flag`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ flag: flagType }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(prev =>
          prev.map(sub =>
            sub._id === id ? { ...sub, flag: flagType } : sub
          )
        );
        
        if (selectedSubmission && selectedSubmission._id === id) {
          setSelectedSubmission({ ...selectedSubmission, flag: flagType });
        }
        
        toast({
          title: 'Flagged',
          description: `Submission marked as ${getFlagLabel(flagType)}`,
        });
        
        setShowFlagDropdown(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to flag submission');
      }
    } catch (error) {
      console.error('Error flagging submission:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getFlagLabel = (flagType) => {
    const flags = {
      'immediate': 'Immediate Attention',
      'follow_up': 'Follow Up Required',
      'important': 'Important',
      'spam': 'Potential Spam',
      'archived': 'Archived'
    };
    return flags[flagType] || flagType;
  };

  const getFlagColor = (flagType) => {
    const colors = {
      'immediate': 'bg-red-100 text-red-800 border-red-200',
      'follow_up': 'bg-orange-100 text-orange-800 border-orange-200',
      'important': 'bg-blue-100 text-blue-800 border-blue-200',
      'spam': 'bg-gray-100 text-gray-800 border-gray-200',
      'archived': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[flagType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const exportToCSV = () => {
    setExportLoading(true);
    
    try {
      const dataToExport = filteredSubmissions.length > 0 ? filteredSubmissions : submissions;
      
      if (dataToExport.length === 0) {
        toast({
          title: 'No Data',
          description: 'No contact submissions available to export',
          variant: 'destructive',
        });
        return;
      }

      const headers = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Flag', 'Submission Date', 'Submission Time'];
      
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(submission => [
          `"${submission.name}"`,
          `"${submission.email}"`,
          `"${submission.phone || 'Not provided'}"`,
          `"${submission.subject}"`,
          `"${submission.message.replace(/"/g, '""')}"`,
          `"${submission.read ? 'Read' : 'Unread'}"`,
          `"${submission.flag ? getFlagLabel(submission.flag) : 'Not flagged'}"`,
          `"${new Date(submission.createdAt).toLocaleDateString()}"`,
          `"${new Date(submission.createdAt).toLocaleTimeString()}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export Successful',
        description: `Exported ${dataToExport.length} contact submissions to CSV`,
        className: 'bg-green-50 text-green-800 border-green-200',
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export contact submissions',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const openSubmissionDetails = (submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
    // Mark as read when opening details
    if (!submission.read) {
      handleMarkAsRead(submission._id, false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
    setShowFlagDropdown(false);
  };

  const unreadCount = submissions.filter(sub => !sub.read).length;
  const flaggedCount = submissions.filter(sub => sub.flag).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Contact Submissions</h1>
              <p className="text-blue-100">Manage and review contact form submissions</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{submissions.length}</div>
            <div className="text-blue-100 text-sm">Total Submissions</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
              <p className="text-sm text-gray-600">Total Messages</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              <p className="text-sm text-gray-600">Unread Messages</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{flaggedCount}</p>
              <p className="text-sm text-gray-600">Flagged Messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Submissions</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
              <option value="flagged">Flagged Only</option>
            </select>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <Button
              onClick={exportToCSV}
              disabled={exportLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {exportLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export CSV
            </Button>

          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              Contact Messages
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredSubmissions.length} of {submissions.length})
              </span>
            </h2>
            {searchTerm && (
              <Button
                variant="ghost"
                onClick={() => setSearchTerm('')}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear search
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {filteredSubmissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No submissions found' : 'No contact submissions yet'}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchTerm 
                  ? `No submissions match "${searchTerm}". Try a different search term.`
                  : 'Contact form submissions will appear here once users start submitting messages.'
                }
              </p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSubmissions.map((submission, index) => (
                <motion.div
                  key={submission._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-6 hover:bg-gray-50 transition-colors duration-200 ${
                    !submission.read ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !submission.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{submission.name}</span>
                        {!submission.read && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                        {submission.flag && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getFlagColor(submission.flag)}`}>
                            <Flag className="w-3 h-3 mr-1" />
                            {getFlagLabel(submission.flag)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{submission.email}</p>
                      <p className="font-medium text-gray-900 mb-1">{submission.subject}</p>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {submission.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(submission.createdAt).toLocaleDateString()} at {new Date(submission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSubmissionDetails(submission)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(submission._id, submission.read)}
                      className={`border ${
                        !submission.read
                          ? 'bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {submission.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedSubmission.name}</h2>
                      <p className="text-blue-100">{selectedSubmission.subject}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeModal}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedSubmission.email}</p>
                    </div>
                  </div>
                  {selectedSubmission.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedSubmission.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submission Details */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Submitted On</p>
                    <p className="font-medium">
                      {new Date(selectedSubmission.createdAt).toLocaleDateString()} at{' '}
                      {new Date(selectedSubmission.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Message
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedSubmission.flag && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getFlagColor(selectedSubmission.flag)}`}>
                        <Flag className="w-4 h-4 mr-1" />
                        {getFlagLabel(selectedSubmission.flag)}
                      </span>
                    )}
                  </div>
                  
                  <div className="relative">
                    {/* <Button
                      onClick={() => setShowFlagDropdown(!showFlagDropdown)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Flag className="w-4 h-4" />
                      Actions
                      <ChevronDown className="w-4 h-4" />
                    </Button> */}
                    
                    {showFlagDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => handleFlagSubmission(selectedSubmission._id, 'immediate')}
                            className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded flex items-center gap-2"
                          >
                            <Flag className="w-4 h-4" />
                            Immediate Attention
                          </button>
                          <button
                            onClick={() => handleFlagSubmission(selectedSubmission._id, 'follow_up')}
                            className="w-full text-left px-3 py-2 text-sm text-orange-700 hover:bg-orange-50 rounded flex items-center gap-2"
                          >
                            <Flag className="w-4 h-4" />
                            Follow Up Required
                          </button>
                          <button
                            onClick={() => handleFlagSubmission(selectedSubmission._id, 'important')}
                            className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded flex items-center gap-2"
                          >
                            <Flag className="w-4 h-4" />
                            Important
                          </button>
                          <button
                            onClick={() => handleFlagSubmission(selectedSubmission._id, 'spam')}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2"
                          >
                            <Flag className="w-4 h-4" />
                            Potential Spam
                          </button>
                          <button
                            onClick={() => handleFlagSubmission(selectedSubmission._id, 'archived')}
                            className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded flex items-center gap-2"
                          >
                            <Flag className="w-4 h-4" />
                            Archived
                          </button>
                          {selectedSubmission.flag && (
                            <button
                              onClick={() => handleFlagSubmission(selectedSubmission._id, null)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2 border-t border-gray-100"
                            >
                              <X className="w-4 h-4" />
                              Remove Flag
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContactSubmissions;