import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Trash2, Send, Users, Search, Calendar, Filter, Download, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getAuthHeaders, validateAdminSession, adminLogout } from '@/utils/adminAuth';
import { Input } from '@/components/ui/input';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

const Newsletter = () => {
  const { toast } = useToast();
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  useEffect(() => {
    filterAndSortSubscribers();
  }, [newsletterSubscribers, searchTerm, sortBy]);

  const loadSubscribers = async () => {
    if (!validateAdminSession()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribers`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        adminLogout();
        return;
      }

      const data = await response.json();
      setNewsletterSubscribers(data.subscribers || []);
    } catch (error) {
      console.error('Error loading subscribers:', error);
      setNewsletterSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSubscribers = () => {
    let filtered = newsletterSubscribers.filter(subscriber =>
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort subscribers
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.subscribedAt || 0);
      const dateB = new Date(b.subscribedAt || 0);

      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredSubscribers(filtered);
  };

  const handleUnsubscribe = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setNewsletterSubscribers(prev => prev.filter(sub => sub.email !== email));
        toast({
          title: 'Unsubscribed',
          description: `${email} has been removed from newsletter`,
          className: 'bg-green-50 text-green-800 border-green-200',
        });
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe user',
        variant: 'destructive',
      });
    }
  };

  const handleBulkUnsubscribe = async (emails) => {
    // Implement bulk unsubscribe logic here
    toast({
      title: 'Bulk Action',
      description: 'Bulk unsubscribe feature coming soon',
    });
  };

  const exportToCSV = () => {
    setExportLoading(true);

    try {
      // Prepare data for CSV
      const dataToExport = filteredSubscribers.length > 0 ? filteredSubscribers : newsletterSubscribers;

      if (dataToExport.length === 0) {
        toast({
          title: 'No Data',
          description: 'No subscribers data available to export',
          variant: 'destructive',
        });
        return;
      }

      // Create CSV headers
      const headers = ['Email', 'Subscription Date', 'Status'];

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(subscriber => [
          `"${subscriber.email}"`,
          `"${subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleDateString() : 'Unknown'}"`,
          '"Active"'
        ].join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: `Exported ${dataToExport.length} subscribers to CSV`,
        className: 'bg-green-50 text-green-800 border-green-200',
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export subscribers data',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const exportAllToCSV = () => {
    setExportLoading(true);

    try {
      if (newsletterSubscribers.length === 0) {
        toast({
          title: 'No Data',
          description: 'No subscribers data available to export',
          variant: 'destructive',
        });
        return;
      }

      // Create CSV headers with additional fields
      const headers = ['Email', 'Subscription Date', 'Subscription Time', 'Status'];

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...newsletterSubscribers.map(subscriber => [
          `"${subscriber.email}"`,
          `"${subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleDateString() : 'Unknown'}"`,
          `"${subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleTimeString() : 'Unknown'}"`,
          '"Active"'
        ].join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `all-newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: `Exported all ${newsletterSubscribers.length} subscribers to CSV`,
        className: 'bg-green-50 text-green-800 border-green-200',
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export subscribers data',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscribers...</p>
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
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
              <p className="text-blue-100">Manage your newsletter audience and subscriptions</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{newsletterSubscribers.length}</div>
            <div className="text-blue-100 text-sm">Total Subscribers</div>
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
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleBulkUnsubscribe([])}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Bulk Actions
              </Button>

              {/* Export Buttons */}
              <div className="relative group">
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

                {/* Dropdown for export options */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={exportToCSV}
                    disabled={exportLoading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Export Current View ({filteredSubscribers.length})
                  </button>
                  <button
                    onClick={exportAllToCSV}
                    disabled={exportLoading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg flex items-center gap-2 border-t border-gray-100"
                  >
                    <Download className="w-4 h-4" />
                    Export All ({newsletterSubscribers.length})
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Subscriber List
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredSubscribers.length} of {newsletterSubscribers.length})
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
          {filteredSubscribers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No subscribers found' : 'No subscribers yet'}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchTerm
                  ? `No subscribers match "${searchTerm}". Try a different search term.`
                  : 'Subscribers will appear here once they sign up for your newsletter.'
                }
              </p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSubscribers.map((subscriber, index) => (
                <motion.div
                  key={subscriber.id || subscriber.email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{subscriber.email}</p>
                      {subscriber.subscribedAt && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Subscribed {new Date(subscriber.subscribedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnsubscribe(subscriber.email)}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span>Ready for export: {filteredSubscribers.length} subscribers</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Newsletter;