
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, User, CreditCard, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [savedDocuments, setSavedDocuments] = useState([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const docs = JSON.parse(localStorage.getItem('savedDocuments') || '[]');
    setSavedDocuments(docs);
  }, [user, navigate]);

  const handleDelete = (docId) => {
    const updatedDocs = savedDocuments.filter(doc => doc.id !== docId);
    setSavedDocuments(updatedDocs);
    localStorage.setItem('savedDocuments', JSON.stringify(updatedDocs));
    toast({
      title: "Document Deleted",
      description: "Document has been removed from your library."
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your document is being prepared..."
    });
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - StartupDocs Builder</title>
        <meta name="description" content="Manage your documents, subscriptions, and account settings." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-xl text-gray-600">Manage your documents and account</p>
          </motion.div>

          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="mb-8 bg-white p-2 rounded-lg shadow">
              <TabsTrigger value="documents" className="px-6 py-3">
                <FileText className="w-4 h-4 mr-2" />
                My Documents
              </TabsTrigger>
              <TabsTrigger value="subscription" className="px-6 py-3">
                <CreditCard className="w-4 h-4 mr-2" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="profile" className="px-6 py-3">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="px-6 py-3">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Saved Documents</h2>
                {savedDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-4">No saved documents yet</p>
                    <Button onClick={() => navigate('/templates')} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      Browse Templates
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedDocuments.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
                      >
                        <FileText className="w-12 h-12 text-blue-600 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Document #{doc.id}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Saved: {new Date(doc.savedAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleDownload} className="flex-1">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="subscription">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Subscription Details</h2>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Free Plan</h3>
                      <p className="text-gray-600">5 downloads remaining this month</p>
                    </div>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold">Active</span>
                  </div>
                  <Button onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profile">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <p className="text-lg text-gray-900">{user?.name || 'User Name'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-lg text-gray-900">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <p className="text-lg text-gray-900">{user?.company || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Account Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800">
                      <strong>💡 Settings Panel:</strong> Account preferences, notification settings, and security options will be available here.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
  