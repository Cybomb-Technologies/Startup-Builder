import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Edit3, ArrowRight, ChevronRight, Crown, Lock, Download, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

// API service - same as in TemplateLibraryPage
const apiService = {
  baseURL: (process.env.NODE_ENV === 'production')
    ? 'https://api.paplixo.com/api'
    : `${API_BASE_URL}/api`,

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

  async getTemplates() {
    // Public endpoint - shows all templates
    const data = await this.makeRequest('/templates');
    return data.templates || data.data || data;
  },

  async getCategories() {
    const data = await this.makeRequest('/categories');
    return data.categories || data.data || data;
  },

  async checkTemplateAccess(templateId) {
    const token = localStorage.getItem('token');
    if (!token) {
      return { hasAccess: false, message: 'Please login to check access' };
    }

    try {
      const response = await this.makeRequest(`/users/template-access/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      console.error('Check template access error:', error);
      return { hasAccess: false, message: error.message };
    }
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

  async getUserPlanDetails() {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const data = await this.makeRequest('/users/plan-details', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return data.data;
    } catch (error) {
      console.error('Get user plan details error:', error);
      return null;
    }
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

// Access Level Badge component
const AccessLevelBadge = ({ accessLevel, userPlan }) => {
  const getAccessColor = (level) => {
    const colorMap = {
      'free': 'bg-gray-500/20 text-gray-700 border-gray-300',
      'pro': 'bg-blue-500/20 text-blue-700 border-blue-300',
      'business': 'bg-purple-500/20 text-purple-700 border-purple-300',
      'enterprise': 'bg-green-500/20 text-green-700 border-green-300',
      'premium': 'bg-yellow-500/20 text-yellow-700 border-yellow-300'
    };

    const levelName = accessLevel?.name?.toLowerCase() || 'free';
    return colorMap[levelName] || 'bg-gray-500/20 text-gray-700 border-gray-300';
  };

  const canAccessTemplate = (templateLevel, userPlanId) => {
    if (!userPlanId || templateLevel === 'free') return true;

    const accessHierarchy = {
      'free': ['free'],
      'pro': ['free', 'pro'],
      'business': ['free', 'pro', 'business'],
      'enterprise': ['free', 'pro', 'business', 'enterprise']
    };

    const allowedAccess = accessHierarchy[userPlanId] || ['free'];
    return allowedAccess.includes(templateLevel);
  };

  const templateLevel = accessLevel?.name?.toLowerCase() || 'free';
  const hasAccess = canAccessTemplate(templateLevel, userPlan?.planId);

  return (
    <div className="relative">
      <Badge variant="outline" className={`${getAccessColor(accessLevel)} font-medium ${!hasAccess ? 'opacity-70' : ''}`}>
        {accessLevel?.name || 'Free'}
        {!hasAccess && <Lock className="w-3 h-3 ml-1" />}
      </Badge>
      {!hasAccess && (
        <div className="absolute -top-1 -right-1">
          <Crown className="w-4 h-4 text-yellow-500" fill="currentColor" />
        </div>
      )}
    </div>
  );
};

const TemplatesSection = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [userPlan, setUserPlan] = useState(null);

  // Fetch user plan details if authenticated
  useEffect(() => {
    const loadUserPlanDetails = async () => {
      if (!isAuthenticated) return;

      try {
        console.log('🔄 Loading user plan details...');
        const planDetails = await apiService.getUserPlanDetails();
        setUserPlan(planDetails);
        console.log('✅ Loaded user plan details:', planDetails);
      } catch (err) {
        console.error('❌ Error loading plan details:', err);
      }
    };

    loadUserPlanDetails();
  }, [isAuthenticated]);

  // Fetch user favorites if authenticated
  useEffect(() => {
    const loadUserFavorites = async () => {
      if (!isAuthenticated) return;

      try {
        console.log('🔄 Loading user favorites...');
        const favoritesData = await apiService.getUserFavorites();
        const favoriteIds = favoritesData.map(fav => fav.template?._id || fav.template);
        setFavorites(new Set(favoriteIds));
        console.log(`✅ Loaded ${favoriteIds.length} favorites`);
      } catch (err) {
        console.error('❌ Error loading favorites:', err);
      }
    };

    loadUserFavorites();
  }, [isAuthenticated]);

  // Fetch categories and templates dynamically
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        console.log('🔄 Loading categories...');
        const categoriesData = await apiService.getCategories();
        const categoriesList = categoriesData || [];

        if (!categoriesList || categoriesList.length === 0) {
          throw new Error('No categories found');
        }

        setCategories(categoriesList.slice(0, 5));

        // Fetch all templates and group by category
        console.log('🔄 Loading templates...');
        const templatesData = await apiService.getTemplates();
        const allTemplates = templatesData || [];

        // Enhance templates with file extension
        const enhancedTemplates = allTemplates.map(template => {
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

        // Group templates by category
        const templatesByCategory = {};

        for (const category of categoriesList.slice(0, 5)) {
          const categoryTemplates = enhancedTemplates.filter(template =>
            template.category?._id === category._id ||
            template.category === category._id
          );

          templatesByCategory[category._id] = categoryTemplates.slice(0, 5);
        }

        setTemplates(templatesByCategory);
        console.log(`✅ Loaded ${enhancedTemplates.length} templates across categories`);

      } catch (error) {
        console.error('❌ Error fetching data:', error);
        toast({
          title: "Connection Error",
          description: "Unable to load templates. Please try again later.",
          variant: "destructive"
        });
        setCategories([]);
        setTemplates({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper: Check if user can access specific template
  const canUserAccessTemplate = (template) => {
    if (!isAuthenticated) {
      // Non-logged in users can only access free templates
      return template.accessLevel?.name?.toLowerCase() === 'free';
    }

    if (!userPlan) {
      // If we couldn't load plan details, assume free plan
      return template.accessLevel?.name?.toLowerCase() === 'free';
    }

    const userPlanId = userPlan.planId?.toLowerCase();
    const templateAccessLevel = template.accessLevel?.name?.toLowerCase();

    // Free templates are accessible to everyone
    if (templateAccessLevel === 'free') {
      return true;
    }

    // Define access hierarchy
    const accessHierarchy = {
      'free': ['free'],
      'pro': ['free', 'pro'],
      'business': ['free', 'pro', 'business'],
      'enterprise': ['free', 'pro', 'business', 'enterprise']
    };

    const allowedAccess = accessHierarchy[userPlanId] || ['free'];
    return allowedAccess.includes(templateAccessLevel);
  };

  const getTemplateImage = (template) => {
    // Try different possible image URL fields
    const imageUrl = template.imageUrls?.[0]?.url ||
      template.images?.[0]?.url ||
      template.previewImages?.[0] ||
      template.image ||
      template.thumbnail;

    if (imageUrl && typeof imageUrl === 'string') {
      return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
    }

    // Return a generic placeholder if no image available
    return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&h=400&fit=crop';
  };

  const toggleFavorite = async (template, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add favorites",
        variant: "destructive"
      });
      return;
    }

    // Check if user has access to this template
    const hasAccess = canUserAccessTemplate(template);
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "Upgrade your plan to add this template to favorites.",
        variant: "destructive"
      });
      return;
    }

    try {
      const templateId = template._id;
      const isCurrentlyFavorite = favorites.has(templateId);

      if (isCurrentlyFavorite) {
        await apiService.removeFromFavorites(templateId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(templateId);
          return newFavorites;
        });

        toast({
          title: "Removed from Favorites",
          description: "Template removed from your favorites"
        });
      } else {
        await apiService.addToFavorites(templateId);
        setFavorites(prev => new Set(prev).add(templateId));
        toast({
          title: "Added to Favorites!",
          description: "Template added to your favorites"
        });
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (template, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to edit templates",
        variant: "destructive"
      });
      return;
    }

    // Check if user has access to this template
    const hasAccess = canUserAccessTemplate(template);
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "Upgrade your plan to edit this template.",
        variant: "destructive"
      });
      return;
    }

    const templateId = template._id;
    const userId = user?._id || user?.id;
    window.location.href = `/editor/${templateId}?user=${userId}`;
  };

  const handlePreview = (template, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to preview templates",
        variant: "destructive"
      });
      return;
    }

    // Check if user has access to this template
    const hasAccess = canUserAccessTemplate(template);
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "Upgrade your plan to preview this template.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to template library with preview
    window.location.href = `/templates?preview=${template._id}`;
  };

  if (loading) {
    return (
      <section className="py-6 bg-white">
        <div className="max-w-[95%] mx-auto px-2">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading templates...</p>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-[95%] mx-auto px-2">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Templates Available</h3>
            <p className="text-gray-600 mb-4">Please check back later or contact support.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[95%] mx-auto px-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Professional Templates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready-to-use business document templates
            {isAuthenticated && userPlan && (
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700">
                {userPlan.plan} Plan
              </span>
            )}
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mt-2">
              Sign in to access all features and templates
            </p>
          )}
        </motion.div>

        {/* Access Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border max-w-2xl mx-auto">
          <div className="text-sm font-medium text-gray-700">Access Levels:</div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-xs text-gray-600">Free - Everyone</span>
            </div>
            <div className="flex items-center gap-1">
              <Crown className="w-4 h-4 text-yellow-500" fill="currentColor" />
              <span className="text-xs text-gray-600">Premium - Plan based</span>
            </div>
          </div>
          {!isAuthenticated && (
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">Login required for actions</span>
            </div>
          )}
        </div>

        {/* Categories with Templates */}
        <div className="space-y-12">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {category.name}
                </h3>

                {/* More Button */}
                <Link to={`/templates?category=${category._id}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Templates Grid */}
              {templates[category._id] && templates[category._id].length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {templates[category._id].map((template, templateIndex) => {
                    const hasAccess = canUserAccessTemplate(template);
                    const isFavorite = favorites.has(template._id);

                    return (
                      <motion.div
                        key={template._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: templateIndex * 0.1 }}
                        className={`group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border overflow-hidden cursor-pointer ${!hasAccess ? 'border-yellow-300' : 'border-gray-100'
                          }`}
                        onMouseEnter={() => setHoveredTemplate(template._id)}
                        onMouseLeave={() => setHoveredTemplate(null)}
                      >
                        {/* Template Image */}
                        <div className="relative h-80 overflow-hidden">
                          <img
                            src={getTemplateImage(template)}
                            alt={template.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                          {/* Premium Badge if no access */}
                          {!hasAccess && (
                            <div className="absolute top-4 right-4">
                              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                Premium
                              </div>
                            </div>
                          )}

                          {/* Template Name Overlay */}
                          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-all duration-300 ${hoveredTemplate === template._id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}>
                            <h4 className="font-semibold text-white text-lg line-clamp-2 text-center">
                              {template.name}
                              {!hasAccess && (
                                <Lock className="w-4 h-4 text-yellow-500 inline-block ml-2" />
                              )}
                            </h4>
                          </div>

                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
                            <TooltipProvider>
                              {/* Favorite Button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => toggleFavorite(template, e)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!isAuthenticated || !hasAccess}
                                  >
                                    <Heart
                                      className={`w-5 h-5 ${isFavorite ? 'fill-current text-red-500' : ''}`}
                                    />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {!isAuthenticated ? 'Login to add favorites' :
                                    !hasAccess ? 'Upgrade plan to add to favorites' :
                                      isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                </TooltipContent>
                              </Tooltip>

                              {/* Edit Button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => handleEdit(template, e)}
                                    className="absolute top-4 left-4 p-2 rounded-full bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!isAuthenticated || !hasAccess}
                                  >
                                    <Edit3 className="w-5 h-5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {!hasAccess ? 'Upgrade plan to edit' : 'Edit template'}
                                </TooltipContent>
                              </Tooltip>

                              {/* Preview Button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => handlePreview(template, e)}
                                    className="absolute bottom-4 right-4 p-2 rounded-full bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!isAuthenticated || !hasAccess}
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {!hasAccess ? 'Upgrade plan to preview' : 'Preview template'}
                                </TooltipContent>
                              </Tooltip>

                              {/* File Type Badge */}
                              <div className="absolute bottom-4 left-4">
                                <FileExtensionBadge format={template.fileExtension} />
                              </div>
                            </TooltipProvider>
                          </div>
                        </div>

                        {/* Template Info */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <AccessLevelBadge accessLevel={template.accessLevel} userPlan={userPlan} />
                            {/* <span className="text-xs text-gray-500">
                              {template.downloadCount || 0} downloads
                            </span> */}
                          </div>

                          {!hasAccess && isAuthenticated && (
                            <div className="mt-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                              <p className="text-xs text-yellow-800 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Upgrade to {userPlan?.plan || 'Free'} Plan to access this template
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No templates available in this category yet</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View All Templates Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-12"
        >
          <Link to="/templates">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Browse All Templates
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mt-4">
              Sign in to access premium templates and features
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TemplatesSection;