import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Upload, Users, FileText, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/admin');
    }
    const storedTemplates = JSON.parse(localStorage.getItem('templates') || '[]');
    setTemplates(storedTemplates);
  }, [user, navigate]);

  const handleDelete = (templateId) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    toast({
      title: "Template Deleted",
      description: "The template has been removed successfully."
    });
  };

  const stats = [
    { label: 'Total Templates', value: templates.length, icon: FileText, color: 'blue' },
    { label: 'Active Users', value: '5,678', icon: Users, color: 'green' },
    { label: 'Downloads Today', value: '892', icon: TrendingUp, color: 'purple' },
    { label: 'New This Week', value: '45', icon: Plus, color: 'orange' }
  ];

  return (
    <>
      <Helmet>
        <title>Admin Panel - StartupDocs Builder</title>
        <meta name="description" content="Manage templates, users, and analytics." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600">Manage your platform</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-blue-600`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="mb-8 bg-white p-2 rounded-lg shadow">
              <TabsTrigger value="templates" className="px-6 py-3"><FileText className="w-4 h-4 mr-2" />Templates</TabsTrigger>
              <TabsTrigger value="users" className="px-6 py-3"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
              <TabsTrigger value="analytics" className="px-6 py-3"><TrendingUp className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Manage Templates</h2>
                  <Button onClick={() => navigate('/admin/upload')} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Template
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4">Title</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Format</th>
                        <th className="p-4">Access</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {templates.map(template => (
                        <tr key={template.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{template.title || template.name}</td>
                          <td className="p-4">{template.category}</td>
                          <td className="p-4">{template.format}</td>
                          <td className="p-4">{template.access}</td>
                          <td className="p-4 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/upload?edit=${template.id}`)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(template.id)}><Trash2 className="w-4 h-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4 text-gray-900">User Management</h2>
                <p className="text-gray-600">This feature is coming soon. You'll be able to manage users and their subscriptions here.</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <TrendingUp className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Analytics Dashboard</h2>
                <p className="text-gray-600">This feature is coming soon. Track downloads, popular templates, and user engagement.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminPage;