import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Star, 
  Eye, 
  Loader2,
  RefreshCw,
  Image,
  FileText,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Bookmark,
  Zap,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

      if (options.body instanceof FormData || options.headers?.['Content-Type'] === null) {
        delete config.headers['Content-Type'];
      }

      const response = await fetch(url, config);

      if (response.status === 401) {
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

  async downloadTemplate(templateId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Please login to download templates');
    }

    try {
      const response = await fetch(`${this.baseURL}/users/templates/${templateId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
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

      const contentDisposition = response.headers.get('content-disposition');
      let filename = `template-${templateId}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
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
      'docx': 'bg-blue-500/20 text-blue-700 border-blue-300',
      'doc': 'bg-blue-500/20 text-blue-700 border-blue-300',
      'xlsx': 'bg-green-500/20 text-green-700 border-green-300',
      'xls': 'bg-green-500/20 text-green-700 border-green-300',
      'csv': 'bg-green-500/20 text-green-700 border-green-300',
      'pdf': 'bg-red-500/20 text-red-700 border-red-300',
      'pptx': 'bg-orange-500/20 text-orange-700 border-orange-300',
      'ppt': 'bg-orange-500/20 text-orange-700 border-orange-300',
      'txt': 'bg-gray-500/20 text-gray-700 border-gray-300',
      'rtf': 'bg-gray-500/20 text-gray-700 border-gray-300',
    };
    
    return colorMap[ext] || 'bg-gray-500/20 text-gray-700 border-gray-300';
  };

  return (
    <Badge variant="outline" className={`${getExtensionColor(formatLower)} font-medium`}>
      .{formatLower}
    </Badge>
  );
};

// Quick Stats Component
const QuickStats = ({ templates, filteredTemplates }) => {
  const stats = [
    {
      label: "Total Templates",
      value: templates.length,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      label: "Filtered",
      value: filteredTemplates.length,
      icon: Filter,
      color: "text-green-600"
    },
    {
      label: "Categories",
      value: new Set(templates.map(t => t.category?._id)).size,
      icon: Bookmark,
      color: "text-purple-600"
    },
    {
      label: "Most Popular",
      value: Math.max(...templates.map(t => t.downloadCount || 0)),
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br from-gray-50 to-white ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

const TemplateLibraryPage = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accessLevels, setAccessLevels] = useState([]);
  const [userFavorites, setUserFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [filters, setFilters] = useState({ 
    fileType: 'all', 
    access: 'all',
    sortBy: 'newest'
  });
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [connectionTested, setConnectionTested] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Image carousel state
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
      
      const [
        templatesData,
        categoriesData,
        accessLevelsData
      ] = await Promise.all([
        apiService.getTemplates().catch(err => { throw new Error(`Templates: ${err.message}`) }),
        apiService.getCategories().catch(err => { throw new Error(`Categories: ${err.message}`) }),
        apiService.getAccessLevels().catch(err => { throw new Error(`Access Levels: ${err.message}`) })
      ]);

      setCategories(categoriesData || []);
      setAccessLevels(accessLevelsData || []);

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
          imageUrls: template.imageUrls || []
        };
      });
      
      setTemplates(enhancedTemplates);
      console.log(`✅ Loaded ${enhancedTemplates.length} templates`);
      console.log('📊 Sample template:', enhancedTemplates[0]);

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

    if (!isAuthenticated) {
      setUpgradeModalOpen(true);
      return;
    }

    try {
      switch (action) {
        case 'edit': {
          const documentId = template._id || template.id || template.documentId;
          navigate(`/editor/${documentId}`);
          setTimeout(() => {
            window.dispatchEvent(new Event('templateEdited'));
          }, 1000);
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
          window.dispatchEvent(new Event('templateDownloaded'));
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

  const getUniqueFileTypes = () => {
    const fileTypes = templates
      .map(template => template.fileExtension?.toLowerCase())
      .filter(Boolean)
      .filter((type, index, arr) => arr.indexOf(type) === index);
    
    return fileTypes.map(type => ({
      _id: type,
      name: type.toUpperCase(),
      extension: type
    }));
  };

  // FIXED: Category filtering logic
  const filteredTemplates = templates
    .filter(template => {
      // Category filter - handle both object and string formats
      const matchesCategory = selectedCategory === 'all' || 
        template.category?._id === selectedCategory || 
        template.category === selectedCategory ||
        (typeof template.category === 'object' && template.category?._id === selectedCategory) ||
        (typeof template.category === 'string' && template.category === selectedCategory);

      // Subcategory filter
      const matchesSubcategory = selectedSubCategory === 'all' || 
        template.subCategory?._id === selectedSubCategory || 
        template.subCategory === selectedSubCategory ||
        (typeof template.subCategory === 'object' && template.subCategory?._id === selectedSubCategory) ||
        (typeof template.subCategory === 'string' && template.subCategory === selectedSubCategory);

      // Search filter
      const matchesSearch = searchQuery === '' || 
        template.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.tags && template.tags.some(tag => 
          tag?.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      
      // File type filter
      const matchesFileType = filters.fileType === 'all' || 
        template.fileExtension?.toLowerCase() === filters.fileType;
      
      // Access level filter
      const matchesAccess = filters.access === 'all' || 
        template.accessLevel?.name?.toLowerCase() === filters.access;

      console.log(`🔍 Filtering template "${template.name}":`, {
        matchesCategory,
        matchesSubcategory,
        matchesSearch,
        matchesFileType,
        matchesAccess,
        category: template.category,
        selectedCategory
      });

      return matchesCategory && matchesSubcategory && matchesSearch && matchesFileType && matchesAccess;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'popular':
          return (b.downloadCount || 0) - (a.downloadCount || 0);
        case 'name':
          return a.name?.localeCompare(b.name || '');
        default:
          return 0;
      }
    });

  const [currentSubCategories, setCurrentSubCategories] = useState([]);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      getSubCategoriesForCategory(selectedCategory).then(setCurrentSubCategories);
    } else {
      setCurrentSubCategories([]);
    }
  }, [selectedCategory]);

  const fileTypes = getUniqueFileTypes();

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Template Card Component
  const TemplateCard = ({ template, index }) => {
    const isFavorite = userFavorites.has(template._id);
    const hasImages = template.imageUrls && template.imageUrls.length > 0;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card className="h-full bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Template Thumbnail */}
          <TemplateThumbnail 
            template={template}
            className="h-48"
            onImageClick={() => handleOpenImageCarousel(template)}
          />
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
                  {template.name}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavorite(template._id)}
                      disabled={!isAuthenticated}
                      className={`h-8 w-8 p-0 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Heart 
                        className="w-4 h-4" 
                        fill={isFavorite ? 'currentColor' : 'none'} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            <div className="flex items-center gap-2 mb-3">
              <FileExtensionBadge format={template.fileExtension} />
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                {template.category?.name || 'Uncategorized'}
              </Badge>
              {hasImages && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  <Image className="w-3 h-3 mr-1" />
                  {template.imageUrls.length}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{template.downloadCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <div className="flex gap-2 w-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenImageCarousel(template)}
                      disabled={!hasImages}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasImages ? `Preview (${template.imageUrls.length} images)` : 'No preview available'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                onClick={() => handleAction('edit', template)}
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction('download', template)}
                      disabled={downloading === template._id || !isAuthenticated}
                    >
                      {downloading === template._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isAuthenticated ? 'Download template' : 'Login to download'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Templates - StartupDocs Builder</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
        <Helmet>
          <title>Error - StartupDocs Builder</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Templates</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={loadAllData} className="bg-blue-600 hover:bg-blue-700">
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
        <title>Template Library - StartupDocs Builder</title>
        <meta name="description" content="Browse professional business document templates with preview images across Accounts, HR, Legal, Business, and Marketing categories." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
                <p className="text-gray-600 text-sm">Professional documents for your business</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <QuickStats templates={templates} filteredTemplates={filteredTemplates} />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-80 flex-shrink-0 hidden lg:block">
              <div className="space-y-6 sticky top-24">
                {/* Search */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Templates</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category._id}
                          onClick={() => setSelectedCategory(category._id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory === category._id
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Filters */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          File Type
                        </label>
                        <Select
                          value={filters.fileType}
                          onValueChange={(value) => setFilters(f => ({ ...f, fileType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All file types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All file types</SelectItem>
                            {fileTypes.map(fileType => (
                              <SelectItem key={fileType._id} value={fileType.extension}>
                                {fileType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Sort By
                        </label>
                        <Select
                          value={filters.sortBy}
                          onValueChange={(value) => setFilters(f => ({ ...f, sortBy: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="name">Name A-Z</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {filteredTemplates.length} Templates
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedCategory !== 'all' 
                      ? `in ${categories.find(c => c._id === selectedCategory)?.name || 'Selected Category'}` 
                      : 'across all categories'}
                  </p>
                </div>

                {!isAuthenticated && (
                  <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Sign In to Access
                  </Button>
                )}
              </div>

              {/* Subcategories Tabs */}
              {currentSubCategories.length > 0 && selectedCategory !== 'all' && (
                <div className="mb-6">
                  <Tabs value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                    <TabsList className="flex-wrap h-auto bg-white p-2 rounded-lg shadow">
                      <TabsTrigger value="all" className="px-4 py-2">
                        All Subcategories
                      </TabsTrigger>
                      {currentSubCategories.map((sub) => (
                        <TabsTrigger key={sub._id} value={sub._id} className="px-4 py-2">
                          {sub.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Templates Grid */}
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTemplates.map((template, index) => (
                    <TemplateCard
                      key={template._id}
                      template={template}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedSubCategory('all');
                      setFilters({ fileType: 'all', access: 'all', sortBy: 'newest' });
                    }}
                    variant="outline"
                  >
                    Clear all filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Dialog */}
      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-1">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category._id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">File Type</h3>
              <Select
                value={filters.fileType}
                onValueChange={(value) => setFilters(f => ({ ...f, fileType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All file types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All file types</SelectItem>
                  {fileTypes.map(fileType => (
                    <SelectItem key={fileType._id} value={fileType.extension}>
                      {fileType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters(f => ({ ...f, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Carousel */}
      <TemplateImageCarousel
        images={selectedTemplateImages}
        isOpen={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        templateName={selectedTemplateName}
        onDownload={handleDownloadImage}
      />

      {/* Authentication Dialog */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isAuthenticated ? "Template Access" : "Authentication Required"}
            </DialogTitle>
            <DialogDescription>
              {isAuthenticated 
                ? "You have access to all templates." 
                : "Please log in to access templates."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="mb-6 text-gray-600">
              {isAuthenticated 
                ? "All templates are available for download in your account." 
                : "Join StartupDocs Builder to start creating and downloading documents."}
            </p>
            <Button 
              onClick={() => navigate(isAuthenticated ? '/templates' : '/login')} 
              className="bg-blue-600 hover:bg-blue-700"
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