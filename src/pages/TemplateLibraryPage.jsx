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
  Users,
  Lock,
  Crown,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderOpen,
  Grid,
  List,
  LayoutGrid,
  MoreVertical,
  Check,
  Tag,
  Hash,
  Layers,
  Filter as FilterIcon
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

import Metatags from "../SEO/metatags.jsx";

const metaPropsData = {
  title:
    "Free Templates to edit Online - PDF, Word, Excel | paplixo",
  description:
    "Discover a vast library of free, customizable templates for PDF, Word, Excel, and more. Edit online with ease at paplixo.",
  keyword:
    "free templates, online template editor, customizable templates, PDF templates, Word templates, Excel templates, document templates, template library, edit templates online, paplixo templates",
  image:
    "https://res.cloudinary.com/dcfjt8shw/image/upload/v1761288318/wn8m8g8skdpl6iz2rwoa.svg",
  url: "https://paplixo.com/templates",
};

// Import the dropdown components
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

// Import the separate components
import TemplateImageCarousel from '@/components/TemplateImageCarousel';
import TemplateThumbnail from '@/components/TemplateThumbnail';

// API service (keep as is - same as before)
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

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.templates)) return data.templates;
    if (Array.isArray(data?.data)) return data.data;

    // fallback
    return [];
  },

  async getCategories() {
    const data = await this.makeRequest('/categories');
    const categories = data.categories || data.data || data;
    return Array.isArray(categories) ? categories : [];
  },

  async getSubCategories() {
    const data = await this.makeRequest('/subcategories');
    const subcats = data.subcategories || data.data || data;
    return Array.isArray(subcats) ? subcats : [];
  },

  async getAccessLevels() {
    const data = await this.makeRequest('/access-levels');
    const levels = data.accessLevels || data.data || data;
    return Array.isArray(levels) ? levels : [];
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

      if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Access denied. Upgrade your plan.');
      }

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
    const data = await this.makeRequest('/users/favorites', {
      method: 'POST',
      body: JSON.stringify({ templateId }),
    });
    return data;
  },

  async removeFromFavorites(templateId) {
    const data = await this.makeRequest(`/users/favorites/${templateId}`, {
      method: 'DELETE',
    });
    return data;
  },

  async getUserFavorites() {
    const data = await this.makeRequest('/users/favorites');
    return Array.isArray(data?.favorites) ? data.favorites : [];
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

// Quick Stats Component
const QuickStats = ({ templates, filteredTemplates, userPlan }) => {
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
      label: "Your Plan",
      value: userPlan?.plan || 'Free',
      icon: Zap,
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

// Scalable Category Selector for Sidebar Only
const SidebarCategorySelector = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  categoryCounts = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Calculate total templates
  const totalTemplates = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Show first 5 categories by default, show all when "Show All" is clicked
  const maxVisible = 3;
  const visibleCategories = showAll ? filteredCategories : filteredCategories.slice(0, maxVisible);

  const hasManyCategories = categories.length > maxVisible;
  const hasSearchResults = searchTerm && filteredCategories.length > 0;

  // Color generator for selected category
  const getCategoryColor = (categoryId) => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'bg-gradient-to-r from-purple-500 to-purple-600',
      'bg-gradient-to-r from-green-500 to-green-600',
      'bg-gradient-to-r from-orange-500 to-orange-600',
      'bg-gradient-to-r from-red-500 to-red-600',
      'bg-gradient-to-r from-pink-500 to-pink-600',
      'bg-gradient-to-r from-indigo-500 to-indigo-600',
      'bg-gradient-to-r from-teal-500 to-teal-600'
    ];

    const index = categories.findIndex(c => c._id === categoryId);
    return colors[index % colors.length] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Categories
            {/* <Badge variant="secondary" className="ml-2">
              {categories.length}
            </Badge> */}
          </h3>
        </div>

        {/* Search for categories */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category list with scroll */}
        <div className="max-h-96 overflow-y-auto pr-2">
          {/* All Categories Option */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg mb-2 transition-all duration-200 ${selectedCategory === 'all'
              ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md'
              : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-gray-100'}`}>
                <LayoutGrid className={`w-4 h-4 ${selectedCategory === 'all' ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="text-left">
                <span className="font-semibold">All Templates</span>
                <p className="text-xs text-gray-500">Browse all categories</p>
              </div>
            </div>
            {/* <Badge variant={selectedCategory === 'all' ? "secondary" : "outline"}>
              {totalTemplates}
            </Badge> */}
          </button>

          {/* Categories List */}
          <div className="space-y-2">
            {visibleCategories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${selectedCategory === category._id
                  ? `${getCategoryColor(category._id)} text-white shadow-md`
                  : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${selectedCategory === category._id ? 'bg-white/20' : 'bg-gray-100'}`}>
                    <Folder className={`w-4 h-4 ${selectedCategory === category._id ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="text-left">
                    <span className="font-medium block">{category.name}</span>
                    {category.description && (
                      <span className="text-xs text-gray-500 block truncate max-w-[150px]">
                        {category.description}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCategory === category._id && (
                    <Check className="w-4 h-4" />
                  )}
                </div>
              </button>
            ))}

            {/* Show More/Less Button */}
            {hasManyCategories && filteredCategories.length > maxVisible && !showAll && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ChevronDown className="w-4 h-4" />
                  Show More ({filteredCategories.length - maxVisible} more)
                </Button>
              </div>
            )}

            {/* Show Less Button */}
            {showAll && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(false)}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </Button>
              </div>
            )}

            {/* No search results */}
            {searchTerm && filteredCategories.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">No categories found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Search results info */}
        {hasSearchResults && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Found {filteredCategories.length} categories matching "{searchTerm}"
            </p>
          </div>
        )}

        {/* Selected Category Info */}
        {selectedCategory !== 'all' && categories.find(c => c._id === selectedCategory) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
          >
            <div className="flex items-start gap-3">
              <Folder className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-800">
                  {categories.find(c => c._id === selectedCategory)?.name}
                </h4>
                {categories.find(c => c._id === selectedCategory)?.description && (
                  <p className="text-sm text-blue-600 mt-1">
                    {categories.find(c => c._id === selectedCategory)?.description}
                  </p>
                )}
                {categoryCounts[selectedCategory] > 0 && (
                  <p className="text-xs text-blue-500 mt-1">
                    {categoryCounts[selectedCategory]} templates available
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

// Mobile Category Selector (for dialog)
const MobileCategorySelector = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  categoryCounts = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTemplates = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Categories</h3>
        <Badge variant="outline">{categories.length}</Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="h-64 overflow-y-auto space-y-2">
        {/* All Categories */}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between ${selectedCategory === 'all'
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
        >
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            <span className="font-medium">All Templates</span>
          </div>

        </button>

        {/* Categories */}
        {filteredCategories.map((category) => (
          <button
            key={category._id}
            onClick={() => setSelectedCategory(category._id)}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${selectedCategory === category._id
              ? 'bg-blue-100 border border-blue-300 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
              }`}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              <div>
                <span className="block font-medium">{category.name}</span>
                {category.description && (
                  <span className="text-xs text-gray-500 block truncate max-w-[180px]">
                    {category.description}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {categoryCounts[category._id] > 0 && (
                <Badge variant="outline" className="text-xs">
                  {categoryCounts[category._id]}
                </Badge>
              )}
              {selectedCategory === category._id && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </div>
          </button>
        ))}

        {/* No search results */}
        {searchTerm && filteredCategories.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">No categories found</p>
          </div>
        )}
      </div>

      {/* Selected Category Info */}
      {selectedCategory !== 'all' && categories.find(c => c._id === selectedCategory) && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">
                {categories.find(c => c._id === selectedCategory)?.name}
              </p>
              {categoryCounts[selectedCategory] > 0 && (
                <p className="text-xs text-blue-600">
                  {categoryCounts[selectedCategory]} templates
                </p>
              )}
            </div>
          </div>
        </div>
      )}
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
  const [userPlan, setUserPlan] = useState(null);

  // Image carousel state
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedTemplateImages, setSelectedTemplateImages] = useState([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  // Calculate template counts per category
  const categoryCounts = React.useMemo(() => {
    const counts = {};
    templates.forEach(template => {
      const categoryId = template.category?._id || template.category;
      if (categoryId) {
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [templates]);

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

  // Load user favorites and plan details if logged in
  useEffect(() => {
    if (isAuthenticated) {
      loadUserFavorites();
      loadUserPlanDetails();
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

      const safeTemplates =
        Array.isArray(templatesData)
          ? templatesData
          : Array.isArray(templatesData?.templates)
            ? templatesData.templates
            : Array.isArray(templatesData?.data)
              ? templatesData.data
              : [];

      const enhancedTemplates = safeTemplates.map(template => {

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
      console.log(`📊 Loaded ${categoriesData?.length || 0} categories`);
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

  const loadUserPlanDetails = async () => {
    try {
      console.log('🔄 Loading user plan details...');
      const planDetails = await apiService.getUserPlanDetails();
      setUserPlan(planDetails);
      console.log('✅ Loaded user plan details:', planDetails);
    } catch (err) {
      console.error('❌ Error loading plan details:', err);
    }
  };

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

  const handleOpenImageCarousel = (template) => {
    if (!canUserAccessTemplate(template)) {
      toast({
        title: "Access Denied",
        description: "Upgrade your plan to view preview images of this template.",
        variant: "destructive"
      });
      return;
    }

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

    // Check if user has access to this template
    const hasAccess = canUserAccessTemplate(template);
    if (!hasAccess) {
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
          // Double-check access via API
          const accessCheck = await apiService.checkTemplateAccess(docId);
          if (!accessCheck.hasAccess) {
            toast({
              title: "Access Denied",
              description: accessCheck.message || "Upgrade your plan to download this template.",
              variant: "destructive"
            });
            return;
          }

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
          // Double-check access via API
          const previewAccessCheck = await apiService.checkTemplateAccess(docId);
          if (!previewAccessCheck.hasAccess) {
            toast({
              title: "Access Denied",
              description: previewAccessCheck.message || "Upgrade your plan to preview this template.",
              variant: "destructive"
            });
            return;
          }

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

      if (String(err.message).toLowerCase().includes("access denied") ||
        String(err.message).toLowerCase().includes("upgrade your plan")) {
        setUpgradeModalOpen(true);
        toast({
          title: "Plan Upgrade Required",
          description: err.message,
          variant: "destructive"
        });
      } else if (String(err.message).toLowerCase().includes("login")) {
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

    // Find the template to check access
    const template = templates.find(t => t._id === templateId);
    if (template && !canUserAccessTemplate(template)) {
      toast({
        title: "Access Denied",
        description: "Upgrade your plan to add this template to favorites.",
        variant: "destructive"
      });
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

  // Template Card Component
  const TemplateCard = ({ template, index }) => {
    const isFavorite = userFavorites.has(template._id);
    const hasImages = template.imageUrls && template.imageUrls.length > 0;
    const hasAccess = canUserAccessTemplate(template);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card className={`h-full bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden ${!hasAccess ? 'border-yellow-300' : ''}`}>
          {/* Template Thumbnail */}
          <TemplateThumbnail
            template={template}
            className="h-48"
            onImageClick={() => handleOpenImageCarousel(template)}
          />

          {!hasAccess && (
            <div className="absolute top-4 right-4">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
                  {template.name}
                  {!hasAccess && (
                    <Lock className="w-4 h-4 text-yellow-500 inline-block ml-2" />
                  )}
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
                      disabled={!isAuthenticated || !hasAccess}
                      className={`h-8 w-8 p-0 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-600'} ${!hasAccess ? 'opacity-50' : ''}`}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={isFavorite ? 'currentColor' : 'none'}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!isAuthenticated ? 'Login to add favorites' :
                      !hasAccess ? 'Upgrade plan to add to favorites' :
                        isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <AccessLevelBadge accessLevel={template.accessLevel} userPlan={userPlan} />
              {/* {hasImages && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  <Image className="w-3 h-3 mr-1" />
                  {template.imageUrls.length}
                </Badge>
              )} */}
            </div>

            {!hasAccess && isAuthenticated && (
              <div className="mt-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Upgrade to {userPlan?.plan || 'Free'} Plan to access this template
                </p>
              </div>
            )}
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
                      disabled={!hasImages || !hasAccess}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!hasAccess ? 'Upgrade plan to preview' :
                      hasImages ? `Preview (${template.imageUrls.length} images)` : 'No preview available'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleAction('edit', template)}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={!hasAccess}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!hasAccess ? 'Upgrade plan to edit' : 'Edit template'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction('download', template)}
                      disabled={downloading === template._id || !isAuthenticated || !hasAccess}
                    >
                      {downloading === template._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!isAuthenticated ? 'Login to download' :
                      !hasAccess ? 'Upgrade plan to download' :
                        'Download template'}
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
          <title>Loading Templates - Paplixo</title>
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
          <title>Error - Paplixo</title>
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
      <Metatags metaProps={metaPropsData} />
      {/* <Helmet>
        <title>Template Library - Paplixo</title>
        <meta name="description" content="Browse professional business document templates with preview images across Accounts, HR, Legal, Business, and Marketing categories." />
      </Helmet> */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 pt-4 pb-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
                <p className="text-gray-600 text-sm">Browse all templates - access based on your plan</p>
                {userPlan && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 border-blue-300">
                      {userPlan.plan} Plan
                    </Badge>
                    {userPlan.planId !== 'enterprise' && (
                      <Button
                        onClick={() => navigate('/pricing')}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Upgrade
                      </Button>
                    )}
                  </div>
                )}
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
          <QuickStats templates={templates} filteredTemplates={filteredTemplates} userPlan={userPlan} />

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

                {/* Categories Panel - Sidebar Only */}
                <SidebarCategorySelector
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categoryCounts={categoryCounts}
                />

                {/* Access Level Filter */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Access Level</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setFilters(f => ({ ...f, access: 'all' }))}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${filters.access === 'all'
                          ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white'
                          : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                      >
                        <span>All Templates</span>

                      </button>
                      {accessLevels.map((accessLevel) => (
                        <button
                          key={accessLevel._id}
                          onClick={() => setFilters(f => ({ ...f, access: accessLevel.name.toLowerCase() }))}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${filters.access === accessLevel.name.toLowerCase()
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{accessLevel.name}</span>
                            {accessLevel.name.toLowerCase() !== 'free' && (
                              <Crown className="w-3 h-3 text-yellow-500" fill="currentColor" />
                            )}
                          </div>
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

                {/* Plan Info */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Access</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {isAuthenticated ? (
                        <>
                          <span className="font-medium">{userPlan?.plan || 'Free'} Plan</span> - You can access:
                          <ul className="mt-2 space-y-1">
                            {userPlan?.planId === 'free' && <li className="text-sm">• Free templates only</li>}
                            {userPlan?.planId === 'pro' && <li className="text-sm">• Free + Pro templates</li>}
                            {userPlan?.planId === 'business' && <li className="text-sm">• Free + Pro + Business templates</li>}
                            {userPlan?.planId === 'enterprise' && <li className="text-sm">• All templates</li>}
                          </ul>
                        </>
                      ) : (
                        "Login to see your access level"
                      )}
                    </p>
                    <Button
                      onClick={() => navigate(isAuthenticated ? '/pricing' : '/login')}
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isAuthenticated ? 'Upgrade Plan' : 'Login'}
                    </Button>
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
                    {filters.access !== 'all' && ` • ${filters.access.toUpperCase()} access only`}
                    {selectedCategory !== 'all' && categoryCounts[selectedCategory] && ` • ${categoryCounts[selectedCategory]} templates`}
                  </p>
                </div>

                {!isAuthenticated ? (
                  <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Sign In to Access
                  </Button>
                ) : userPlan?.planId === 'free' ? (
                  <Button onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Crown className="w-4 h-4 mr-2" fill="white" />
                    Upgrade to Access More
                  </Button>
                ) : null}
              </div>

              {/* Access Legend */}
              <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
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
                  <div className="flex items-center gap-1 ml-auto">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">Login required for actions</span>
                  </div>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FilterIcon className="w-5 h-5" />
              Filters & Categories
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <MobileCategorySelector
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categoryCounts={categoryCounts}
            />

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Access Level</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilters(f => ({ ...f, access: 'all' }))}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${filters.access === 'all'
                    ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white'
                    : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                >
                  <span>All Templates</span>
                  <Badge variant={filters.access === 'all' ? 'secondary' : 'outline'}>
                    {templates.length}
                  </Badge>
                </button>
                {accessLevels.map((accessLevel) => (
                  <button
                    key={accessLevel._id}
                    onClick={() => setFilters(f => ({ ...f, access: accessLevel.name.toLowerCase() }))}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${filters.access === accessLevel.name.toLowerCase()
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{accessLevel.name}</span>
                      {accessLevel.name.toLowerCase() !== 'free' && (
                        <Crown className="w-3 h-3 text-yellow-500" fill="currentColor" />
                      )}
                    </div>
                    <Badge variant={filters.access === accessLevel.name.toLowerCase() ? 'secondary' : 'outline'}>
                      {templates.filter(t => t.accessLevel?.name?.toLowerCase() === accessLevel.name.toLowerCase()).length}
                    </Badge>
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

            <div className="pt-4 border-t">
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSubCategory('all');
                  setFilters({ fileType: 'all', access: 'all', sortBy: 'newest' });
                }}
                variant="outline"
                className="w-full"
              >
                Clear All Filters
              </Button>
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

      {/* Upgrade Plan Dialog */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" fill="currentColor" />
              Upgrade Your Plan
            </DialogTitle>
            <DialogDescription>
              {isAuthenticated
                ? `Your current ${userPlan?.plan || 'Free'} plan doesn't include this feature.`
                : 'Login to access templates and features.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Access Levels:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span>Free Plan → Free templates only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>Pro Plan → Free + Pro templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span>Business Plan → Free + Pro + Business</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span>Enterprise Plan → All templates</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setUpgradeModalOpen(false);
                    navigate(isAuthenticated ? '/pricing' : '/login');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isAuthenticated ? 'View Plans' : 'Login'}
                </Button>
                <Button
                  onClick={() => setUpgradeModalOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateLibraryPage;