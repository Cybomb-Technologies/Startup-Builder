import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, Edit, Plus, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Templates = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [accessLevels, setAccessLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    accessLevel: "",
    content: "",
    file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get auth headers
  const getAuthHeaders = () => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      console.error('❌ No admin session found');
      return {};
    }

    try {
      const userData = JSON.parse(adminUser);
      const token = userData.token;
      
      if (!token) {
        console.error('❌ No token found in admin session');
        return {};
      }

      return {
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('❌ Error parsing admin user data:', error);
      return {};
    }
  };

  // Load all data from APIs
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('📡 Loading all template data...');
      
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        console.error('❌ No auth headers available');
        toast({
          title: 'Authentication Error',
          description: 'Please login again',
          variant: 'destructive',
        });
        return;
      }

      // Load templates
      const templatesResponse = await fetch('http://localhost:5001/api/admin/templates', {
        headers
      });
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.templates || []);
        console.log('✅ Templates loaded:', templatesData.templates?.length);
      } else {
        console.error('❌ Failed to load templates:', templatesResponse.status);
      }

      // Load categories
      const categoriesResponse = await fetch('http://localhost:5001/api/admin/categories', {
        headers
      });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
        console.log('✅ Categories loaded:', categoriesData.categories?.length);
      } else {
        console.error('❌ Failed to load categories:', categoriesResponse.status);
      }

      // Load access levels
      const accessLevelsResponse = await fetch('http://localhost:5001/api/admin/access-levels', {
        headers
      });
      if (accessLevelsResponse.ok) {
        const accessLevelsData = await accessLevelsResponse.json();
        setAccessLevels(accessLevelsData.accessLevels || []);
        console.log('✅ Access levels loaded:', accessLevelsData.accessLevels?.length);
      } else {
        console.error('❌ Failed to load access levels:', accessLevelsResponse.status);
      }

      // Load all subcategories initially
      const subCategoriesResponse = await fetch('http://localhost:5001/api/admin/subcategories', {
        headers
      });
      if (subCategoriesResponse.ok) {
        const subCategoriesData = await subCategoriesResponse.json();
        setSubCategories(subCategoriesData.subCategories || []);
        console.log('✅ All subcategories loaded:', subCategoriesData.subCategories?.length);
      } else {
        console.error('❌ Failed to load subcategories:', subCategoriesResponse.status);
      }

    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a PDF, Word, Excel, or text file',
          variant: 'destructive',
        });
        return;
      }

      setNewTemplate(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleAddTemplate = async () => {
    // Validate required fields
    if (!newTemplate.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!newTemplate.category) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }

    if (!newTemplate.accessLevel) {
      toast({
        title: 'Validation Error',
        description: 'Please select an access level',
        variant: 'destructive',
      });
      return;
    }

    if (!newTemplate.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template content is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Creating template with data:', newTemplate);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', newTemplate.name.trim());
      formData.append('description', newTemplate.description || '');
      formData.append('category', newTemplate.category);
      
      // Only append subCategory if it exists and is not empty
      if (newTemplate.subCategory && newTemplate.subCategory.trim()) {
        formData.append('subCategory', newTemplate.subCategory);
      }
      
      formData.append('accessLevel', newTemplate.accessLevel);
      formData.append('content', newTemplate.content.trim());
      
      if (newTemplate.file) {
        formData.append('file', newTemplate.file);
      }

      console.log('📤 FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const headers = getAuthHeaders();
      
      // IMPORTANT: Don't set Content-Type header for FormData - let browser set it automatically
      const response = await fetch('http://localhost:5001/api/admin/templates', {
        method: 'POST',
        headers: headers, // Only auth header, no Content-Type
        body: formData,
      });

      console.log('📡 Create template response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        setTemplates(prev => [...prev, data.template]);
        setNewTemplate({
          name: "",
          description: "",
          category: "",
          subCategory: "",
          accessLevel: "",
          content: "",
          file: null
        });
        setShowAddTemplate(false);
        toast({
          title: 'Success',
          description: 'Template created successfully',
        });
        console.log('✅ Template created:', data.template);
        
        // Reload templates to get the latest data
        loadAllData();
      } else {
        const errorData = await response.json();
        console.error('❌ Template creation failed:', errorData);
        
        // More specific error message
        let errorMessage = errorData.message || 'Failed to create template';
        if (response.status === 400) {
          errorMessage = 'Validation failed: ' + errorData.message;
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error creating template:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) return;

      const response = await fetch(`http://localhost:5001/api/admin/templates/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(template => template._id !== id));
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
        });
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field, value) => {
    setNewTemplate(prev => ({
      ...prev,
      [field]: value,
      ...(field === "category" && { subCategory: "" }) // Reset subcategory when category changes
    }));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : '-';
  };

  const getSubCategoryName = (subCategoryId) => {
    const subCategory = subCategories.find(sub => 
      sub._id === subCategoryId || sub._id === subCategoryId?._id
    );
    return subCategory ? subCategory.name : '-';
  };

  const getAccessLevelName = (accessLevelId) => {
    const accessLevel = accessLevels.find(level => level._id === accessLevelId);
    return accessLevel ? accessLevel.name : '-';
  };

  // Get filtered subcategories for the selected category
  const getFilteredSubCategories = () => {
    if (!newTemplate.category) return [];
    
    return subCategories.filter(sub => {
      // Handle both populated category object and category ID string
      const subCategoryId = sub.category?._id || sub.category;
      return subCategoryId === newTemplate.category;
    });
  };

  // Download file
  const handleDownload = async (template) => {
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) return;

      const response = await fetch(`http://localhost:5001/api/admin/templates/${template._id}/download`, {
        headers
      });

      if (response.ok) {
        // Create a blob from the response and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = template.file?.fileName || 'template-file';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Download Started',
          description: 'File download has started',
        });
      } else {
        throw new Error('Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileText className="w-4 h-4" />;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'txt':
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Templates ({templates.length})
        </h2>
        <Button onClick={() => setShowAddTemplate(!showAddTemplate)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Data Loaded:</strong> Categories: {categories.length} | 
          Subcategories: {subCategories.length} | 
          Access Levels: {accessLevels.length}
        </p>
      </div>

      {/* Add Template Dropdown */}
      {showAddTemplate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-50 rounded-lg border"
        >
          <h3 className="font-semibold mb-3">Add New Template</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter template name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newTemplate.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter description"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Category *
              </label>
              <select
                value={newTemplate.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select Main Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                value={newTemplate.subCategory}
                onChange={(e) => handleInputChange("subCategory", e.target.value)}
                disabled={!newTemplate.category || isSubmitting}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Subcategory</option>
                {getFilteredSubCategories().map(subCategory => (
                  <option key={subCategory._id} value={subCategory._id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-xs text-gray-500">
                {newTemplate.category 
                  ? `${getFilteredSubCategories().length} subcategories available` 
                  : 'Select a category first'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Level *
              </label>
              <select
                value={newTemplate.accessLevel}
                onChange={(e) => handleInputChange("accessLevel", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select Access Level</option>
                {accessLevels.map(accessLevel => (
                  <option key={accessLevel._id} value={accessLevel._id}>
                    {accessLevel.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                  disabled={isSubmitting}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {newTemplate.file ? newTemplate.file.name : 'Click to upload file'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Word, Excel, Text files (Max 5MB)
                  </p>
                </label>
              </div>
              {newTemplate.file && (
                <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-700 flex items-center gap-2">
                    {getFileIcon(newTemplate.file.name)}
                    {newTemplate.file.name}
                  </span>
                  <button
                    onClick={() => handleInputChange("file", null)}
                    className="text-red-500 hover:text-red-700"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Content *
              </label>
              <textarea
                value={newTemplate.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter template content or description..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddTemplate(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddTemplate}
              disabled={!newTemplate.name || !newTemplate.category || !newTemplate.accessLevel || !newTemplate.content || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1" />
                  Create Template
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Templates Table */}
      {templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No templates available</p>
          <p className="text-sm">Create your first template to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Category</th>
                <th className="p-3 border">Subcategory</th>
                <th className="p-3 border">File</th>
                <th className="p-3 border">Access</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{template.name}</td>
                  <td className="p-3">{getCategoryName(template.category)}</td>
                  <td className="p-3">{getSubCategoryName(template.subCategory)}</td>
                  <td className="p-3">
                    {template.file && template.file.fileName ? (
                      <div className="flex items-center gap-2">
                        {getFileIcon(template.file.fileName)}
                        <span className="text-sm">{template.file.fileName}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(template)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No file</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getAccessLevelName(template.accessLevel) === "Public" ? "bg-green-100 text-green-800" :
                      getAccessLevelName(template.accessLevel) === "Private" ? "bg-red-100 text-red-800" :
                      getAccessLevelName(template.accessLevel) === "Team Only" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {getAccessLevelName(template.accessLevel)}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(template._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default Templates;