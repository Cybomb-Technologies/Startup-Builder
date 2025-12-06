import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, Edit, Plus, Upload, Download, Eye, X, Image, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Templates = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [accessLevels, setAccessLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [showViewTemplate, setShowViewTemplate] = useState(false);
  const [showEditTemplate, setShowEditTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    accessLevel: "",
    content: "",
    file: null,
    previewImages: [] // NEW: Added preview images array
  });
  const [editTemplate, setEditTemplate] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    accessLevel: "",
    content: "",
    file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // NEW STATE FOR IMAGE MANAGEMENT
  const [showImageManager, setShowImageManager] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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
      const templatesResponse = await fetch(`${API_BASE_URL}/api/admin/templates`, {
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
      const categoriesResponse = await fetch(`${API_BASE_URL}/api/admin/categories`, {
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
      const accessLevelsResponse = await fetch(`${API_BASE_URL}/api/admin/access-levels`, {
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
      const subCategoriesResponse = await fetch(`${API_BASE_URL}/api/admin/subcategories`, {
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

  // Handle file selection for add (DOCUMENT FILE)
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

  // NEW: Handle preview images selection
  const handlePreviewImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate each image
    const validImages = files.filter(file => {
      // Validate image type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid image type',
          description: `${file.name} is not a supported image format`,
          variant: 'destructive',
        });
        return false;
      }

      // Validate image size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Image too large',
          description: `${file.name} exceeds 5MB limit`,
          variant: 'destructive',
        });
        return false;
      }

      return true;
    });

    if (validImages.length > 0) {
      setNewTemplate(prev => ({
        ...prev,
        previewImages: [...(prev.previewImages || []), ...validImages]
      }));
      
      toast({
        title: 'Images added',
        description: `Added ${validImages.length} preview image(s)`,
      });
    }
  };

  // NEW: Remove individual preview image
  const removePreviewImage = (index) => {
    setNewTemplate(prev => ({
      ...prev,
      previewImages: prev.previewImages?.filter((_, i) => i !== index) || []
    }));
  };

  // Handle file selection for edit
  const handleEditFileChange = (e) => {
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

      setEditTemplate(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  // UPDATED: Handle Add Template with image upload
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

    if (!newTemplate.file) {
      toast({
        title: 'Validation Error',
        description: 'Document file is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Creating template with data:', newTemplate);
      
      // Step 1: Create the template with the document file
      const formData = new FormData();
      formData.append('name', newTemplate.name.trim());
      formData.append('description', newTemplate.description || '');
      formData.append('category', newTemplate.category);
      
      if (newTemplate.subCategory && newTemplate.subCategory.trim()) {
        formData.append('subCategory', newTemplate.subCategory);
      }
      
      formData.append('accessLevel', newTemplate.accessLevel);
      formData.append('content', newTemplate.content.trim());
      formData.append('file', newTemplate.file);

      const headers = getAuthHeaders();
      delete headers['Content-Type'];
      
      const response = await fetch(`${API_BASE_URL}/api/admin/templates`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create template');
      }

      const templateData = await response.json();
      const createdTemplate = templateData.template;

      console.log('✅ Template created:', createdTemplate);

      // Step 2: Upload preview images if any were selected
      if (newTemplate.previewImages && newTemplate.previewImages.length > 0) {
        try {
          await handleImageUpload(createdTemplate._id, newTemplate.previewImages);
          console.log('✅ Preview images uploaded');
        } catch (imageError) {
          console.error('❌ Error uploading preview images:', imageError);
          // Don't fail the entire creation if image upload fails
          toast({
            title: 'Template created with image upload warning',
            description: 'Template was created but some images failed to upload',
            variant: 'default',
          });
        }
      }

      // Reset form and show success
      setNewTemplate({
        name: "",
        description: "",
        category: "",
        subCategory: "",
        accessLevel: "",
        content: "",
        file: null,
        previewImages: []
      });
      setShowAddTemplate(false);
      
      toast({
        title: 'Success',
        description: newTemplate.previewImages && newTemplate.previewImages.length > 0 
          ? `Template created with ${newTemplate.previewImages.length} preview images` 
          : 'Template created successfully',
      });
      
      // Reload templates to get the latest data
      loadAllData();
      
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

  // Handle Edit Template
  const handleEditTemplate = async () => {
    if (!selectedTemplate) return;

    // Validate required fields
    if (!editTemplate.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!editTemplate.category) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }

    if (!editTemplate.accessLevel) {
      toast({
        title: 'Validation Error',
        description: 'Please select an access level',
        variant: 'destructive',
      });
      return;
    }

    if (!editTemplate.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template content is required',
        variant: 'destructive',
      });
      return;
    }

    setIsEditing(true);

    try {
      console.log('📤 Updating template with data:', editTemplate);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', editTemplate.name.trim());
      formData.append('description', editTemplate.description || '');
      formData.append('category', editTemplate.category);
      
      if (editTemplate.subCategory && editTemplate.subCategory.trim()) {
        formData.append('subCategory', editTemplate.subCategory);
      }
      
      formData.append('accessLevel', editTemplate.accessLevel);
      formData.append('content', editTemplate.content.trim());
      
      if (editTemplate.file) {
        formData.append('file', editTemplate.file);
      }

      const headers = getAuthHeaders();
      delete headers['Content-Type'];
      
      const response = await fetch(`${API_BASE_URL}/api/admin/templates/${selectedTemplate._id}`, {
        method: 'PUT',
        headers: headers,
        body: formData,
      });

      console.log('📡 Update template response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        
        // Update the template in the local state
        setTemplates(prev => prev.map(template => 
          template._id === selectedTemplate._id ? data.template : template
        ));
        
        setShowEditTemplate(false);
        setSelectedTemplate(null);
        toast({
          title: 'Success',
          description: 'Template updated successfully',
        });
        console.log('✅ Template updated:', data.template);
        
      } else {
        const errorData = await response.json();
        console.error('❌ Template update failed:', errorData);
        
        let errorMessage = errorData.message || 'Failed to update template';
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
      console.error('❌ Error updating template:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) return;

      const response = await fetch(`${API_BASE_URL}/api/admin/templates/${id}`, {
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

  // NEW: Handle image upload
  const handleImageUpload = async (templateId, images) => {
    try {
      setUploadingImages(true);
      const headers = getAuthHeaders();
      delete headers['Content-Type']; // Let browser set content type
      
      const formData = new FormData();
      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/templates/${templateId}/images`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  // NEW: Handle image deletion
  const handleDeleteImage = async (templateId, imageId) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/templates/${templateId}/images/${imageId}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Image deleted successfully' });
        loadAllData(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete image error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete image', 
        variant: 'destructive' 
      });
    }
  };

  // NEW: Set primary image
  const handleSetPrimaryImage = async (templateId, imageId) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}api/admin/templates/${templateId}/images/${imageId}/primary`, {
        method: 'PUT',
        headers: headers,
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Primary image updated' });
        loadAllData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set primary image');
      }
    } catch (error) {
      console.error('Set primary image error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to set primary image', 
        variant: 'destructive' 
      });
    }
  };

  // View Template Details
  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowViewTemplate(true);
  };

  // Edit Template - Open modal with current data
  const handleEditClick = (template) => {
    setSelectedTemplate(template);
    setEditTemplate({
      name: template.name,
      description: template.description || '',
      category: template.category?._id || template.category,
      subCategory: template.subCategory?._id || template.subCategory,
      accessLevel: template.accessLevel?._id || template.accessLevel,
      content: template.content,
      file: null
    });
    setShowEditTemplate(true);
  };

  // Download file
  const handleDownload = async (template) => {
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        toast({
          title: 'Authentication Error',
          description: 'Please login again',
          variant: 'destructive',
        });
        return;
      }

      // Check if template has a file
      if (!template.file || !template.file.fileName) {
        toast({
          title: 'No File',
          description: 'No file attached to this template',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/templates/${template._id}/download`, {
        headers,
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        
        if (blob.size === 0) {
          throw new Error('Downloaded file is empty');
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = template.file.fileName;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Download Started',
          description: `Downloading ${template.file.fileName}`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download file');
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field, value) => {
    setNewTemplate(prev => ({
      ...prev,
      [field]: value,
      ...(field === "category" && { subCategory: "" })
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditTemplate(prev => ({
      ...prev,
      [field]: value,
      ...(field === "category" && { subCategory: "" })
    }));
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return '-';
    
    // Check if categoryId is an object with _id property
    const category = categories.find(cat => 
      cat._id === (categoryId._id || categoryId)
    );
    return category ? category.name : '-';
  };

  const getSubCategoryName = (subCategoryId) => {
    if (!subCategoryId) return '-';
    
    const subCategory = subCategories.find(sub => 
      sub._id === (subCategoryId._id || subCategoryId)
    );
    return subCategory ? subCategory.name : '-';
  };

  // FIXED: Get access level name - handle both object and ID
  const getAccessLevelName = (accessLevel) => {
    if (!accessLevel) return '-';
    
    // If accessLevel is an object with name property
    if (typeof accessLevel === 'object' && accessLevel !== null) {
      return accessLevel.name || '-';
    }
    
    // If accessLevel is a string ID
    const level = accessLevels.find(level => 
      level._id === accessLevel
    );
    return level ? level.name : '-';
  };

  // Get filtered subcategories for the selected category
  const getFilteredSubCategories = () => {
    if (!newTemplate.category) return [];
    
    return subCategories.filter(sub => {
      const subCategoryId = sub.category?._id || sub.category;
      return subCategoryId === newTemplate.category;
    });
  };

  // Get filtered subcategories for edit
  const getFilteredEditSubCategories = () => {
    if (!editTemplate.category) return [];
    
    return subCategories.filter(sub => {
      const subCategoryId = sub.category?._id || sub.category;
      return subCategoryId === editTemplate.category;
    });
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Image Manager Modal Component
  const ImageManagerModal = () => {
    if (!showImageManager || !selectedTemplate) return null;

    const images = selectedTemplate.imageUrls || [];
    const currentImage = images[currentImageIndex];

    const nextImage = () => {
      setCurrentImageIndex(prev => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    };

    const prevImage = () => {
      setCurrentImageIndex(prev => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    };

    const handleFileUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      try {
        await handleImageUpload(selectedTemplate._id, files);
        toast({ title: 'Success', description: 'Images uploaded successfully' });
        // Reset file input
        e.target.value = '';
      } catch (error) {
        // Error handled in handleImageUpload
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-xl font-semibold">
              Manage Images - {selectedTemplate.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageManager(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6">
            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImages}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, WebP, GIF (Max 5MB each)
                  </p>
                </label>
              </div>
            </div>

            {/* Image Gallery */}
            {images.length > 0 ? (
              <div>
                <h4 className="text-lg font-medium mb-4">
                  Template Images ({images.length})
                </h4>
                
                {/* Main Image Viewer */}
                <div className="relative bg-gray-100 rounded-lg p-4 mb-4">
                  {currentImage && (
                    <div className="relative">
                      <img
                        src={currentImage.url}
                        alt={currentImage.altText}
                        className="max-w-full max-h-96 object-contain mx-auto rounded"
                      />
                      
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  
                  <div className="text-center mt-2">
                    <span className="text-sm text-gray-600">
                      Image {currentImageIndex + 1} of {images.length}
                      {currentImage?.isPrimary && (
                        <span className="ml-2 text-yellow-600">
                          <Star className="w-3 h-3 inline fill-current" /> Primary
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Image Thumbnails */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative border-2 rounded overflow-hidden cursor-pointer ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={image.thumbnail || image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                      {image.isPrimary && (
                        <div className="absolute top-1 left-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Image Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSetPrimaryImage(selectedTemplate._id, currentImage.fileId)}
                    disabled={currentImage?.isPrimary}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Set as Primary
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this image?')) {
                        handleDeleteImage(selectedTemplate._id, currentImage.fileId);
                        if (currentImageIndex >= images.length - 1) {
                          setCurrentImageIndex(0);
                        }
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No images uploaded yet</p>
                <p className="text-sm">Upload some images to showcase this template</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
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

      {/* Image Manager Modal */}
      <ImageManagerModal />

      {/* Add Template Dropdown */}
      {showAddTemplate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-50 rounded-lg border"
        >
          <h3 className="font-semibold mb-3">Add New Template</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template Name */}
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

            {/* Description */}
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

            {/* Main Category */}
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

            {/* Subcategory */}
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
            </div>

            {/* Access Level */}
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

            {/* Document File Upload - REQUIRED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Document File *
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
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {newTemplate.file ? newTemplate.file.name : 'Click to upload document'}
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

            {/* NEW: Preview Images Upload - OPTIONAL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Preview Images (Optional)
              </label>
              <div className="border-2 border-dashed border-blue-300 rounded-md p-4 text-center bg-blue-50">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePreviewImagesChange}
                  className="hidden"
                  id="preview-images-upload"
                  disabled={isSubmitting}
                />
                <label htmlFor="preview-images-upload" className="cursor-pointer">
                  <Image className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {newTemplate.previewImages && newTemplate.previewImages.length > 0 
                      ? `${newTemplate.previewImages.length} images selected` 
                      : 'Click to upload preview images'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, WebP, GIF (Max 5MB each)
                  </p>
                </label>
              </div>
              {newTemplate.previewImages && newTemplate.previewImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700 mb-2">Selected images:</p>
                  <div className="space-y-2">
                    {newTemplate.previewImages.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                        <span className="text-sm text-blue-700 flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          {file.name}
                        </span>
                        <button
                          onClick={() => removePreviewImage(index)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Template Content */}
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
              disabled={!newTemplate.name || !newTemplate.category || !newTemplate.accessLevel || !newTemplate.content || !newTemplate.file || isSubmitting}
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

      {/* View Template Modal */}
      {showViewTemplate && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Template Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewTemplate(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900 font-medium">{selectedTemplate.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{selectedTemplate.description || 'No description'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{getCategoryName(selectedTemplate.category)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <p className="text-gray-900">{getSubCategoryName(selectedTemplate.subCategory) || 'No subcategory'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getAccessLevelName(selectedTemplate.accessLevel) === "Public" ? "bg-green-100 text-green-800" :
                    getAccessLevelName(selectedTemplate.accessLevel) === "Private" ? "bg-red-100 text-red-800" :
                    getAccessLevelName(selectedTemplate.accessLevel) === "Team Only" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {getAccessLevelName(selectedTemplate.accessLevel)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-gray-900">{formatDate(selectedTemplate.createdAt)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preview Images</label>
                  <p className="text-gray-900">
                    {selectedTemplate.imageUrls?.length || 0} images
                    {selectedTemplate.imageUrls && selectedTemplate.imageUrls.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          setShowViewTemplate(false);
                          setShowImageManager(true);
                          setCurrentImageIndex(0);
                        }}
                      >
                        Manage Images
                      </Button>
                    )}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedTemplate.content}</p>
                </div>
              </div>
              
              {selectedTemplate.file && selectedTemplate.file.fileName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attached File</label>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
                    {getFileIcon(selectedTemplate.file.fileName)}
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{selectedTemplate.file.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedTemplate.file.fileSize)} • 
                        {selectedTemplate.file.fileType || 'Unknown type'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(selectedTemplate)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => setShowViewTemplate(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowViewTemplate(false);
                  handleEditClick(selectedTemplate);
                }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Template
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditTemplate && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Edit Template</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditTemplate(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={editTemplate.name}
                    onChange={(e) => handleEditInputChange("name", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter template name"
                    disabled={isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editTemplate.description}
                    onChange={(e) => handleEditInputChange("description", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter description"
                    disabled={isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Category *
                  </label>
                  <select
                    value={editTemplate.category}
                    onChange={(e) => handleEditInputChange("category", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isEditing}
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
                    value={editTemplate.subCategory}
                    onChange={(e) => handleEditInputChange("subCategory", e.target.value)}
                    disabled={!editTemplate.category || isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Subcategory</option>
                    {getFilteredEditSubCategories().map(subCategory => (
                      <option key={subCategory._id} value={subCategory._id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level *
                  </label>
                  <select
                    value={editTemplate.accessLevel}
                    onChange={(e) => handleEditInputChange("accessLevel", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isEditing}
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
                    Update File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    <input
                      type="file"
                      onChange={handleEditFileChange}
                      className="hidden"
                      id="edit-file-upload"
                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                      disabled={isEditing}
                    />
                    <label htmlFor="edit-file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {editTemplate.file ? editTemplate.file.name : 'Click to update file (optional)'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Word, Excel, Text files (Max 5MB)
                      </p>
                    </label>
                  </div>
                  {selectedTemplate.file && selectedTemplate.file.fileName && (
                    <div className="mt-2 text-xs text-gray-500">
                      Current file: {selectedTemplate.file.fileName} ({formatFileSize(selectedTemplate.file.fileSize)})
                    </div>
                  )}
                  {editTemplate.file && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                      <span className="text-sm text-green-700 flex items-center gap-2">
                        {getFileIcon(editTemplate.file.name)}
                        {editTemplate.file.name}
                      </span>
                      <button
                        onClick={() => handleEditInputChange("file", null)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isEditing}
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
                    value={editTemplate.content}
                    onChange={(e) => handleEditInputChange("content", e.target.value)}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter template content or description..."
                    disabled={isEditing}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditTemplate(false)}
                  disabled={isEditing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditTemplate}
                  disabled={!editTemplate.name || !editTemplate.category || !editTemplate.accessLevel || !editTemplate.content || isEditing}
                >
                  {isEditing ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-1" />
                      Update Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
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
                <th className="p-3 border">Preview Images</th>
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
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{template.file.fileName}</span>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(template.file.fileSize)}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(template)}
                          className="ml-2"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No file</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {template.imageUrls && template.imageUrls.length > 0 ? (
                        <>
                          <span className="flex items-center gap-1 text-green-600">
                            <Image className="w-4 h-4" />
                            {template.imageUrls.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowImageManager(true);
                              setCurrentImageIndex(0);
                            }}
                          >
                            Manage
                          </Button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">No images</span>
                      )}
                    </div>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTemplate(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(template)}
                    >
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