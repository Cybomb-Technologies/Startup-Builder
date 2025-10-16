import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Upload, ArrowLeft, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const categories = {
  accounts: { name: 'Accounts', subcategories: ['Accounting Templates', 'Income Tax', 'Inventory Management', 'Invoices', 'MIS Reports', 'Sales Tax', 'TDS & TCS'] },
  hr: { name: 'Human Resources', subcategories: ['Statutories', 'Engagement Plans', 'Performance Management', 'Records & Formats', 'Training Modules', 'Employee Policy', 'Exit Process', 'Employee Onboarding', 'Company Forms', 'HR Forms', 'Job Descriptions'] },
  legal: { name: 'Legal', subcategories: ['Affidavits', 'Agreement Formats', 'Board Resolutions', 'Bonds', 'Copyrights'] },
  business: { name: 'Business', subcategories: ['Business Plans', 'MIS Templates', 'Notices', 'Pitch Decks', 'Quotations', 'Sales Reports', 'Survey Templates'] },
  marketing: { name: 'Marketing', subcategories: ['Email Templates', 'Indian Festival Infographics'] }
};

const AdminUploadPage = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    access: 'Free',
    tags: '',
    file: null
  });
  const [subcategories, setSubcategories] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (editId) {
      setIsEditMode(true);
      const templates = JSON.parse(localStorage.getItem('templates') || '[]');
      const templateToEdit = templates.find(t => t.id === parseInt(editId));
      if (templateToEdit) {
        setFormData({
          title: templateToEdit.title || templateToEdit.name,
          category: templateToEdit.category,
          subcategory: templateToEdit.subcategory,
          description: templateToEdit.description,
          access: templateToEdit.access,
          tags: templateToEdit.tags.join(', '),
          file: null
        });
        setSubcategories(categories[templateToEdit.category]?.subcategories || []);
      }
    }
  }, [editId]);

  const handleCategoryChange = (value) => {
    setFormData({ ...formData, category: value, subcategory: '' });
    setSubcategories(categories[value]?.subcategories || []);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditMode && !formData.file) {
      toast({ title: "Error", description: "Please upload a file.", variant: "destructive" });
      return;
    }

    const templates = JSON.parse(localStorage.getItem('templates') || '[]');
    const newTemplate = {
      id: isEditMode ? parseInt(editId) : Date.now(),
      title: formData.title,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      access: formData.access,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      format: isEditMode ? templates.find(t => t.id === parseInt(editId)).format : formData.file.name.split('.').pop().toUpperCase(),
      lastUpdated: new Date().toISOString().split('T')[0],
      size: isEditMode ? templates.find(t => t.id === parseInt(editId)).size : `${(formData.file.size / 1024).toFixed(1)}KB`
    };

    let updatedTemplates;
    if (isEditMode) {
      updatedTemplates = templates.map(t => t.id === parseInt(editId) ? newTemplate : t);
    } else {
      updatedTemplates = [...templates, newTemplate];
    }
    
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    toast({
      title: `Template ${isEditMode ? 'Updated' : 'Uploaded'}`,
      description: `The template "${formData.title}" has been successfully ${isEditMode ? 'updated' : 'added'}.`
    });
    navigate('/admin');
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit' : 'Upload'} Template - Admin Panel</title>
        <meta name="description" content="Upload or edit document templates." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="outline" onClick={() => navigate('/admin')} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Dashboard
            </Button>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">{isEditMode ? 'Edit' : 'Upload New'} Template</h1>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Title</label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select value={formData.category} onValueChange={handleCategoryChange} required>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                  <Select value={formData.subcategory} onValueChange={value => setFormData({...formData, subcategory: value})} required disabled={!formData.category}>
                    <SelectTrigger><SelectValue placeholder="Select a subcategory" /></SelectTrigger>
                    <SelectContent>
                      {subcategories.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.docx,.xlsx" onChange={e => setFormData({...formData, file: e.target.files[0]})} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOCX, XLSX up to 10MB</p>
                    {formData.file && <p className="text-sm text-green-600 mt-2">{formData.file.name}</p>}
                    {isEditMode && !formData.file && <p className="text-sm text-gray-500 mt-2">Leave empty to keep the existing file.</p>}
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                  <Select value={formData.access} onValueChange={value => setFormData({...formData, access: value})} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="Pro">Pro</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. HR, Agreement, Invoice" className="pl-10" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  {isEditMode ? 'Update Template' : 'Upload Template'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminUploadPage;