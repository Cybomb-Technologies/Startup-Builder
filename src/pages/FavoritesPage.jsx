import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Heart,
  Star,
  Download,
  Edit,
  Eye,
  Trash2,
  FolderHeart,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Clock,
  Users,
  Zap,
  Crown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// API service for favorites
const apiService = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : `${API_BASE_URL}/api`,

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config = {
        method: options.method || 'GET',
        headers,
        credentials: 'include',
        mode: 'cors',
        ...options,
      };

      if (options.body instanceof FormData) {
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

      return await response.json();

    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  },

  async getFavorites() {
    const data = await this.makeRequest('/users/favorites');
    return data.favorites || [];
  },

  async removeFromFavorites(templateId) {
    return await this.makeRequest(`/users/favorites/${templateId}`, {
      method: 'DELETE'
    });
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
  }
};

// Access Level Badge Component
const AccessLevelBadge = ({ accessLevel }) => {
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

  return (
    <Badge variant="outline" className={`${getAccessColor(accessLevel)} font-medium`}>
      {accessLevel?.name || 'Free'}
    </Badge>
  );
};

// Template Card Component for Favorites
const FavoriteTemplateCard = ({ favorite, onRemove, index }) => {
  const template = favorite.template;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  if (!template) return null;

  const handleEdit = () => {
    navigate(`/editor/${template._id}`);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await apiService.downloadTemplate(template._id);
      toast({
        title: "Download Started",
        description: `${template.name} is being downloaded...`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleRemove = () => {
    onRemove(template._id);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      
      <Card className="h-full bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-pink-300 hover:shadow-lg transition-all duration-300 overflow-hidden group">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-pink-500/10 text-pink-600">
              <Heart className="w-3 h-3 mr-1" fill="currentColor" />
              Favorited
            </Badge>
            {template.category && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                {template.category.name}
              </Badge>
            )}
            <AccessLevelBadge accessLevel={template.accessLevel} />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Added {formatDate(favorite.addedAt)}</span>
            </div>
            {template.downloadCount > 0 && (
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{template.downloadCount || 0}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1" />
              )}
              Download
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [removingId, setRemovingId] = useState(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadFavorites();
  }, [isAuthenticated, navigate]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (templateId) => {
    try {
      setRemovingId(templateId);
      await apiService.removeFromFavorites(templateId);
      setFavorites(prev => prev.filter(fav => fav.template._id !== templateId));
      toast({
        title: "Removed from Favorites",
        description: "Template removed from your favorites."
      });
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRemovingId(null);
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    const template = favorite.template;
    if (!template) return false;
    
    // Search filter
    const matchesSearch = searchQuery === '' || 
      template.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'free' && template.accessLevel?.name?.toLowerCase() === 'free') ||
      (activeTab === 'premium' && template.accessLevel?.name?.toLowerCase() !== 'free');

    return matchesSearch && matchesTab;
  });

  const stats = {
    total: favorites.length,
    free: favorites.filter(f => f.template?.accessLevel?.name?.toLowerCase() === 'free').length,
    premium: favorites.filter(f => f.template?.accessLevel?.name?.toLowerCase() !== 'free').length
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Favorites - Paplixo</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-pink-50/30 to-purple-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading your favorites...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
  <title>My Favorites - Paplixo</title>
  <meta
    name="description"
    content="View and manage your favorite templates on Paplixo. Quickly access the designs you've saved for later."
  />
</Helmet>


      <div className="min-h-screen bg-gradient-to-br from-pink-50/30 to-purple-50/30">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 pt-4 pb-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center">
                    <FolderHeart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
                    <p className="text-gray-600 text-sm">
                      {stats.total} saved template{stats.total !== 1 ? 's' : ''} • 
                      {stats.free} free • {stats.premium} premium
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/templates')} 
                variant="outline"
              >
                <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                Browse More Templates
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-80"
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList className="bg-white">
                  <TabsTrigger value="all">
                    All ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="free">
                    Free ({stats.free})
                  </TabsTrigger>
                  <TabsTrigger value="premium">
                    Premium ({stats.premium})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                      <p className="text-sm text-gray-600">Total Favorites</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100">
                      <FolderHeart className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.free}</p>
                      <p className="text-sm text-gray-600">Free Templates</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.premium}</p>
                      <p className="text-sm text-gray-600">Premium Templates</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100">
                      <Crown className="w-6 h-6 text-yellow-600" fill="currentColor" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Favorites Grid */}
          {filteredFavorites.length > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  Showing {filteredFavorites.length} of {stats.total} favorite{stats.total !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((favorite, index) => (
                  <FavoriteTemplateCard
                    key={favorite._id || favorite.template?._id}
                    favorite={favorite}
                    onRemove={handleRemoveFavorite}
                    index={index}
                  />
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-pink-600" fill="currentColor" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchQuery || activeTab !== 'all' ? 'No matching favorites' : 'No favorites yet'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery || activeTab !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start adding templates to your favorites for quick access. Click the heart icon on any template.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchQuery || activeTab !== 'all' ? (
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('all');
                    }}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    Clear Filters
                  </Button>
                ) : null}
                <Button
                  onClick={() => navigate('/templates')}
                  variant="outline"
                >
                  <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                  Browse Templates
                </Button>
              </div>
            </motion.div>
          )}

          {/* Tips */}
          {stats.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Quick Tips</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" fill="currentColor" />
                      Click the heart icon on any template to add it to favorites
                    </li>
                    <li className="flex items-center gap-2">
                      <Edit className="w-4 h-4 text-blue-500" />
                      Click "Edit" to start editing your favorite template
                    </li>
                    <li className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-gray-500" />
                      Hover over a card and click the trash icon to remove from favorites
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;