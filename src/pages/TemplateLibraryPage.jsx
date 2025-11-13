import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, FileText, Download, Edit, FileType, FileUp, FileDown, FileX, Star, Loader2, RefreshCw, Image, File, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import the separate components
import TemplateImageCarousel from '@/components/TemplateImageCarousel';
import TemplateThumbnail from '@/components/TemplateThumbnail';

// API service
const apiService = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api',

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add authorization header only for authenticated endpoints
      if (token && !endpoint.includes('/templates/images') && !endpoint.includes('/health')) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config = {
        method: options.method || 'GET',
        headers,
        credentials: 'include',
        mode: 'cors',
        ...options,
      };

      // Remove Content-Type for FormData or file downloads
      if (options.body instanceof FormData || options.headers?.['Content-Type'] === null) {
        delete config.headers['Content-Type'];
      }

      console.log(`🚀 Making request to: ${endpoint}`);
      console.log(`🔐 Auth header: ${headers['Authorization'] ? 'Present' : 'Missing'}`);

      const response = await fetch(url, config);

      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Authentication required. Please login again.');
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          const text = await response.text();
          if (text) errorMessage = text.substring(0, 200);
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return response;
      }

      return await response.json();

    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  },

  async testConnection() {
    try {
      const data = await this.makeRequest('/health');
      return data;
    } catch (error) {
      throw new Error(`Cannot connect to server: ${error.message}`);
    }
  },

  async getTemplates() {
    const data = await this.makeRequest('/templates');
    return data.templates || data.data || data;
  },

  async getCategories() {
    const data = await this.makeRequest('/categories');
    return data.categories || data.data || data;
  },

  async getSubCategories() {
    const data = await this.makeRequest('/subcategories');
    return data.subcategories || data.data || data;
  },

  async getAccessLevels() {
    const data = await this.makeRequest('/access-levels');
    return data.accessLevels || data.data || data;
  },

 // In your apiService object, update the downloadTemplate function:

async downloadTemplate(templateId) {
  const token = localStorage.getItem('token');
  console.log('🔐 DOWNLOAD: Token present:', !!token);
  
  if (!token) {
    throw new Error('Please login to download templates');
  }

  try {
    console.log('🚀 Making download request...');
    
    const response = await fetch(`${this.baseURL}/users/templates/${templateId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    console.log('📥 Download response status:', response.status);

    if (response.status === 401) {
      let errorMessage = 'Session expired. Please login again.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.log('❌ 401 Error (no JSON body)');
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🧹 Cleared invalid tokens');
      
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      let errorMessage = `Download failed: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Get filename from response headers
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `template-${templateId}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) filename = filenameMatch[1];
    }

    const blob = await response.blob();
    console.log('📄 Download blob size:', blob.size);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('❌ Download error:', error);
    throw error;
  }
},

  async getTemplatePreview(templateId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please login to view template details');
    }

    const data = await this.makeRequest(`/users/templates/${templateId}/preview`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return data.template;
  },

  async addToFavorites(templateId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please login to add favorites');
    }

    const data = await this.makeRequest('/user/favorites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ templateId }),
    });
    return data;
  },

  async removeFromFavorites(templateId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please login to remove favorites');
    }

    const data = await this.makeRequest(`/user/favorites/${templateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return data;
  },

  async getUserFavorites() {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }

    const data = await this.makeRequest('/user/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return data.favorites || data.data || data;
  },

  async downloadImage(imageUrl) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to download image');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-preview-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

// File Extension Badge component
const FileExtensionBadge = ({ format }) => {
  const formatLower = format?.toLowerCase() || 'file';
  
  const getExtensionColor = (ext) => {
    const colorMap = {
      'docx': 'bg-blue-100 text-blue-700 border border-blue-200',
      'doc': 'bg-blue-100 text-blue-700 border border-blue-200',
      'xlsx': 'bg-green-100 text-green-700 border border-green-200',
      'xls': 'bg-green-100 text-green-700 border border-green-200',
      'csv': 'bg-green-100 text-green-700 border border-green-200',
      'pdf': 'bg-red-100 text-red-700 border border-red-200',
      'pptx': 'bg-orange-100 text-orange-700 border border-orange-200',
      'ppt': 'bg-orange-100 text-orange-700 border border-orange-200',
      'txt': 'bg-gray-100 text-gray-700 border border-gray-200',
      'rtf': 'bg-gray-100 text-gray-700 border border-gray-200',
    };
    
    return colorMap[ext] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${getExtensionColor(formatLower)}`}>
      .{formatLower}
    </span>
  );
};

const TemplateLibraryPage = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accessLevels, setAccessLevels] = useState([]);
  const [userFavorites, setUserFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [filters, setFilters] = useState({ fileType: 'all', access: 'all' });
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [connectionTested, setConnectionTested] = useState(false);
  
  // NEW STATE FOR IMAGE CAROUSEL
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedTemplateImages, setSelectedTemplateImages] = useState([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  // Test server connection first
  useEffect(() => {
    const testServer = async () => {
      try {
        await apiService.testConnection();
        setConnectionTested(true);
        console.log('✅ Server connection successful');
      } catch (err) {
        console.error('❌ Server connection failed:', err);
        setError(`Cannot connect to server: ${err.message}`);
        setLoading(false);
      }
    };

    testServer();
  }, []);

  // Load all data after connection test
  useEffect(() => {
    if (connectionTested) {
      loadAllData();
    }
  }, [connectionTested]);

  // Load user favorites if logged in
  useEffect(() => {
    if (isAuthenticated) {
      loadUserFavorites();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading templates from API...');
      console.log('🔐 Current auth state:', { user: !!user, token: !!token, isAuthenticated });
      
      const [
        templatesData,
        categoriesData,
        accessLevelsData
      ] = await Promise.all([
        apiService.getTemplates().catch(err => { throw new Error(`Templates: ${err.message}`) }),
        apiService.getCategories().catch(err => { throw new Error(`Categories: ${err.message}`) }),
        apiService.getAccessLevels().catch(err => { throw new Error(`Access Levels: ${err.message}`) })
      ]);

      // Set categories and access levels
      setCategories(categoriesData || []);
      setAccessLevels(accessLevelsData || []);

      // Enhanced templates with image support
      const enhancedTemplates = (templatesData || []).map(template => {
        let fileExtension = 'docx';

        if (template.file && template.file.fileName) {
          const fileName = template.file.fileName;
          const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
          if (extensionMatch) {
            fileExtension = extensionMatch[1].toLowerCase();
          }
        } else if (template.fileType) {
          fileExtension = template.fileType.replace(/\./g, '').toLowerCase();
        }

        const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
        if (!validExtensions.includes(fileExtension)) {
          fileExtension = 'docx';
        }

        return {
          ...template,
          fileExtension: fileExtension,
          hasFile: !!(template.file && template.file.fileId),
          // Ensure imageUrls is properly set
          imageUrls: template.imageUrls || []
        };
      });
      
      setTemplates(enhancedTemplates);
      console.log(`✅ Loaded ${enhancedTemplates.length} templates`);

      // Set default category and subcategory
      if (categoriesData && categoriesData.length > 0) {
        const firstCategory = categoriesData[0];
        setSelectedCategory(firstCategory._id);
        
        try {
          const subCategoriesData = await apiService.getSubCategories();
          const categorySubs = subCategoriesData.filter(sub => 
            sub.category?._id === firstCategory._id || sub.category === firstCategory._id
          );
          
          if (categorySubs.length > 0) {
            setSelectedSubCategory(categorySubs[0]._id);
          }
        } catch (subErr) {
          console.warn('Could not load subcategories:', subErr);
        }
      }

    } catch (err) {
      console.error('❌ Error loading data:', err);
      const errorMessage = err.message || 'Failed to load data from server';
      setError(errorMessage);
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserFavorites = async () => {
    try {
      console.log('🔄 Loading user favorites...');
      const favorites = await apiService.getUserFavorites();
      const favoriteIds = favorites.map(fav => fav.template?._id || fav.template);
      setUserFavorites(new Set(favoriteIds));
      console.log(`✅ Loaded ${favoriteIds.length} favorites`);
    } catch (err) {
      console.error('❌ Error loading favorites:', err);
    }
  };

  // NEW: Handle image carousel opening
  const handleOpenImageCarousel = (template) => {
    if (template.imageUrls && template.imageUrls.length > 0) {
      setSelectedTemplateImages(template.imageUrls);
      setSelectedTemplateName(template.name);
      setCarouselOpen(true);
    } else {
      toast({
        title: "No Preview Images",
        description: "This template doesn't have any preview images yet.",
        variant: "destructive"
      });
    }
  };

  // NEW: Handle image download
  const handleDownloadImage = async (image) => {
    try {
      await apiService.downloadImage(image.url);
      toast({
        title: "Image Downloaded",
        description: "Preview image saved to your downloads."
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download image. Please try again.",
        variant: "destructive"
      });
    }
  };

 // In your TemplateLibraryPage.jsx, update the handleAction function:

const handleAction = async (action, template) => {
  const docId = template._id || template.id || template.documentId;

  if (!docId) {
    console.error("❌ No template ID:", template);
    toast({
      title: "Template Error",
      description: "This template cannot be opened.",
      variant: "destructive"
    });
    return;
  }

  // ✅ If user is not logged in, show login modal (not redirect)
  if (!isAuthenticated) {
    setUpgradeModalOpen(true);
    return;
  }

  try {
    switch (action) {

      case 'edit': {
  const documentId = template._id || template.id || template.documentId;

  if (!documentId) {
    toast({
      title: "Template Error",
      description: "This template cannot be opened.",
      variant: "destructive"
    });
    return;
  }

  const userId = user?._id || user?.id;
  if (!userId) {
    navigate('/login');
    return;
  }

  console.log("✅ EDIT ONLINE:", { templateId: documentId, userId });

  // ✅ Correct routing format
  navigate(`/editor/${documentId}?user=${userId}`);

  break;
}

      case 'download':
        setDownloading(docId);
        await apiService.downloadTemplate(docId);
        toast({
          title: "Download Started",
          description: `${template.name} is being downloaded...`
        });
        setDownloading(null);
        break;

      case 'preview':
        setPreviewLoading(true);
        try {
          const enhancedTemplate = await apiService.getTemplatePreview(docId);
          setPreviewTemplate(enhancedTemplate);
        } catch (err) {
          console.warn("Preview fallback → using existing template");
          setPreviewTemplate(template);
        }
        setPreviewLoading(false);
        break;

      default:
        break;
    }
  } catch (err) {
    console.error(`❌ ${action} Error:`, err);

    if (String(err.message).toLowerCase().includes("login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUpgradeModalOpen(true);
      toast({
        title: "Session Expired",
        description: "Please login again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Error",
        description: `Failed to ${action} template. ${err.message}`,
        variant: "destructive"
      });
    }

    setDownloading(null);
    setPreviewLoading(false);
  }
};



  const handleFavorite = async (templateId) => {
    if (!isAuthenticated) {
      setUpgradeModalOpen(true);
      return;
    }

    try {
      const isCurrentlyFavorite = userFavorites.has(templateId);
      
      if (isCurrentlyFavorite) {
        await apiService.removeFromFavorites(templateId);
        setUserFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(templateId);
          return newFavorites;
        });
        toast({ 
          title: "Removed from Favorites", 
          description: "Template removed from your favorites." 
        });
      } else {
        await apiService.addToFavorites(templateId);
        setUserFavorites(prev => new Set(prev).add(templateId));
        toast({ 
          title: "Added to Favorites!", 
          description: "You can find this template in your dashboard." 
        });
      }
    } catch (err) {
      console.error('❌ Error updating favorites:', err);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get subcategories for selected category
  const getSubCategoriesForCategory = async (categoryId) => {
    try {
      const allSubCategories = await apiService.getSubCategories();
      return allSubCategories.filter(sub => 
        sub.category?._id === categoryId || sub.category === categoryId
      );
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  };

  // Get unique file types from templates
  const getUniqueFileTypes = () => {
    const fileTypes = templates
      .map(template => template.fileExtension?.toLowerCase())
      .filter(Boolean)
      .filter((type, index, arr) => arr.indexOf(type) === index);
    
    console.log('📊 Available file types for filter:', fileTypes);
    
    return fileTypes.map(type => ({
      _id: type,
      name: type.toUpperCase(),
      extension: type
    }));
  };

  // Filter templates based on selections
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = !selectedCategory || template.category?._id === selectedCategory || template.category === selectedCategory;
    const matchesSubcategory = !selectedSubCategory || template.subCategory?._id === selectedSubCategory || template.subCategory === selectedSubCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesFileType = filters.fileType === 'all' || 
      template.fileExtension?.toLowerCase() === filters.fileType;
    
    const matchesAccess = filters.access === 'all' || 
      template.accessLevel?.name?.toLowerCase() === filters.access;

    return matchesCategory && matchesSubcategory && matchesSearch && matchesFileType && matchesAccess;
  });

  // Get current category's subcategories
  const [currentSubCategories, setCurrentSubCategories] = useState([]);

  useEffect(() => {
    if (selectedCategory) {
      getSubCategoriesForCategory(selectedCategory).then(setCurrentSubCategories);
    }
  }, [selectedCategory]);

  const fileTypes = getUniqueFileTypes();

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Template Card Component
  const TemplateCard = ({ template, index }) => (
    <motion.div 
      key={template._id}
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.1 }} 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-blue-100 group"
    >
      {/* Use TemplateThumbnail component */}
      <TemplateThumbnail 
        template={template}
        onImageClick={() => handleOpenImageCarousel(template)}
      />
      
      <div className="p-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="text-xl font-semibold text-gray-900 truncate">
                {template.name}
              </h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last Updated: {new Date(template.updatedAt).toLocaleDateString()}</p>
              <p>File Size: {template.fileSize || 'N/A'}</p>
              <p>Downloads: {template.downloadCount || 0}</p>
              <p>File Type: {template.fileExtension}</p>
              <p>Preview Images: {template.imageUrls?.length || 0}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <p className="text-gray-600 my-2 h-10">{template.description}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <FileExtensionBadge format={template.fileExtension} />
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {template.category?.name || 'Uncategorized'}
          </span>
          {template.imageUrls && template.imageUrls.length > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
              <Image className="w-3 h-3" />
              {template.imageUrls.length}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => handleOpenImageCarousel(template)} 
            variant="outline" 
            className="flex-1"
            disabled={!template.imageUrls || template.imageUrls.length === 0}
          >
            <Image className="w-4 h-4 mr-2" />
            Preview{template.imageUrls?.length > 1 ? ` (${template.imageUrls.length})` : ''}
          </Button>
          
     <Button 
  onClick={() => handleAction('edit', template)}
  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
>
  <Edit className="w-4 h-4 mr-2" />
  {isAuthenticated ? 'Edit Online' : 'Login to Edit'}
</Button>


          
          <Button 
            onClick={() => handleAction('download', template)} 
            variant="outline"
            disabled={downloading === template._id || !isAuthenticated}
          >
            {downloading === template._id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </Button>
          
          <Button 
            onClick={() => handleFavorite(template._id)} 
            variant="outline"
            disabled={!isAuthenticated}
            className={userFavorites.has(template._id) ? 'text-yellow-500 border-yellow-300' : ''}
          >
            <Star 
              className="w-4 h-4" 
              fill={userFavorites.has(template._id) ? 'currentColor' : 'none'} 
            />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <>
       
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">
              {connectionTested ? 'Loading templates...' : 'Testing server connection...'}
            </p>
          </div>
        </div>
       
      </>
    );
  }

  if (error) {
    return (
      <>
        
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <FileX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Templates</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-4">
              <Button onClick={loadAllData} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              {!isAuthenticated && (
                <Button onClick={() => navigate('/login')} variant="outline">
                  Login to Access Templates
                </Button>
              )}
            </div>
          </div>
        </div>
        
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Explore Templates - StartupDocs Builder</title>
        <meta name="description" content="Browse professional business document templates with preview images across Accounts, HR, Legal, Business, and Marketing categories." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📂 Explore Templates
            </h1>
            <p className="text-xl text-gray-600">Browse and customize professional business templates with preview images</p>
            {!isAuthenticated && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <strong>Note:</strong> You need to{' '}
                  <button 
                    onClick={() => navigate('/login')} 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    login
                  </button>{' '}
                  to download and edit templates.
                </p>
              </div>
            )}
          </motion.div>

          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                type="text" 
                placeholder="Search templates by name or keyword..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 h-12 text-lg" 
              />
            </div>
            <Select value={filters.fileType} onValueChange={(value) => setFilters(f => ({...f, fileType: value}))}>
              <SelectTrigger className="h-12 w-full md:w-[180px]">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All File Types</SelectItem>
                {fileTypes.map(fileType => (
                  <SelectItem key={fileType._id} value={fileType.extension}>
                    {fileType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.access} onValueChange={(value) => setFilters(f => ({...f, access: value}))}>
              <SelectTrigger className="h-12 w-full md:w-[180px]">
                <SelectValue placeholder="Access Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                {accessLevels.map(level => (
                  <SelectItem key={level._id} value={level.name.toLowerCase()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Categories</h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button 
                      key={category._id}
                      onClick={() => { 
                        setSelectedCategory(category._id);
                      }} 
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedCategory === category._id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="mr-2">{category.icon || '📄'}</span>{category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="lg:col-span-3">
              {selectedCategory && currentSubCategories.length > 0 && (
                <Tabs value={selectedSubCategory} onValueChange={setSelectedSubCategory} className="w-full">
                  <TabsList className="mb-6 flex-wrap h-auto bg-white p-2 rounded-lg shadow">
                    {currentSubCategories.map((sub) => (
                      <TabsTrigger key={sub._id} value={sub._id} className="px-4 py-2">
                        {sub.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value={selectedSubCategory}>
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredTemplates.length > 0 ? filteredTemplates.map((template, index) => (
                        <TemplateCard key={template._id} template={template} index={index} />
                      )) : (
                        <div className="col-span-2 text-center py-12">
                          <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg mb-2">No templates found</p>
                          <p className="text-gray-500">Try adjusting your search or filters.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>

       
      </div>

      {/* Image Carousel Modal */}
      <TemplateImageCarousel
        images={selectedTemplateImages}
        isOpen={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        templateName={selectedTemplateName}
        onDownload={handleDownloadImage}
      />

      {/* Enhanced Preview Dialog */}
      <Dialog open={previewTemplate !== null} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          
          {previewLoading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading preview...</span>
            </div>
          ) : (
            <div className="py-4">
              {previewTemplate?.imageUrls && previewTemplate.imageUrls.length > 0 && (
                <div className="mb-6">
                  <TemplateThumbnail 
                    template={previewTemplate}
                    className="h-64 rounded-lg"
                    onImageClick={() => {
                      setPreviewTemplate(null);
                      handleOpenImageCarousel(previewTemplate);
                    }}
                  />
                  <div className="text-center mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPreviewTemplate(null);
                        handleOpenImageCarousel(previewTemplate);
                      }}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      View All Images ({previewTemplate.imageUrls.length})
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">Category</p>
                  <p className="text-gray-600">{previewTemplate?.category?.name || 'Uncategorized'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Subcategory</p>
                  <p className="text-gray-600">{previewTemplate?.subCategory?.name || 'None'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">File Format</p>
                  <p className="text-gray-600">
                    <FileExtensionBadge format={previewTemplate?.fileExtension} />
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Access Level</p>
                  <p className="text-gray-600">{previewTemplate?.accessLevel?.name || 'Free'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Last Updated</p>
                  <p className="text-gray-600">{new Date(previewTemplate?.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">File Size</p>
                  <p className="text-gray-600">{formatFileSize(previewTemplate?.fileSize)}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Downloads</p>
                  <p className="text-gray-600">{previewTemplate?.downloadCount || 0}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Preview Images</p>
                  <p className="text-gray-600">{previewTemplate?.imageUrls?.length || 0}</p>
                </div>
              </div>
              
              {previewTemplate?.tags && previewTemplate.tags.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-gray-900 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex gap-2">
                <Button 
                  onClick={() => handleAction('edit', previewTemplate)} 
                  variant="outline"
                  className="flex-1"
                  disabled={!isAuthenticated}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isAuthenticated ? 'Edit Online' : 'Login to Edit'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

     {/* Updated Upgrade Required Dialog */}
<Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="text-2xl">
        {isAuthenticated ? "Template Access" : "Authentication Required"}
      </DialogTitle>
      <DialogDescription>
        {isAuthenticated ? "You have access to all templates." : "Please log in to access templates."}
      </DialogDescription>
    </DialogHeader>
    <div className="py-4 text-center">
      <p className="mb-6">
        {isAuthenticated 
          ? "All templates are available for download in your account." 
          : "Join StartupDocs Builder to start creating and downloading documents."}
      </p>
      <Button 
        onClick={() => navigate(isAuthenticated ? '/templates' : '/login')} 
        className="bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        {isAuthenticated ? 'Continue Browsing' : 'Login or Sign Up'}
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </>
  );
};

export default TemplateLibraryPage;