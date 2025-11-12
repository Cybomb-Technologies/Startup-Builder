import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Edit3, ArrowRight, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const TemplatesSection = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  // Fetch templates with preview images from your actual API
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/templates?limit=15');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.status}`);
        }
        
        const data = await response.json();
        const templatesData = data.templates || data.data || data;
        
        console.log('Fetched templates:', templatesData); // Debug log
        
        // Enhance templates with size and orientation based on file type
        const enhancedTemplates = templatesData.map(template => {
          const isSpreadsheet = ['xlsx', 'xls', 'csv'].includes(template.fileExtension?.toLowerCase());
          
          // Determine size and orientation based on file type
          const orientation = isSpreadsheet ? 'landscape' : 'portrait';
          const sizes = ['small', 'medium', 'large'];
          const size = sizes[Math.floor(Math.random() * sizes.length)];
          
          return {
            ...template,
            size,
            orientation
          };
        });
        
        setTemplates(enhancedTemplates.slice(0, 15));
        
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: "Error",
          description: "Failed to load templates. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch user favorites if authenticated
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const favoriteIds = data.favorites?.map(fav => fav.template?._id || fav.template) || [];
          setFavorites(new Set(favoriteIds));
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  const getSizeClasses = (size, orientation) => {
    const baseClasses = "relative overflow-hidden bg-gray-100 rounded-lg border border-gray-200 transition-all duration-700";
    
    const sizeMap = {
      small: {
        portrait: "aspect-[3/4]",
        landscape: "aspect-[4/3]"
      },
      medium: {
        portrait: "aspect-[3/4]",
        landscape: "aspect-[4/3]"
      },
      large: {
        portrait: "aspect-[3/4]",
        landscape: "aspect-[4/3]"
      }
    };

    return `${baseClasses} ${sizeMap[size]?.[orientation] || sizeMap.medium.portrait}`;
  };

  const getGridColSpan = (size, orientation) => {
    if (size === 'large' && orientation === 'landscape') {
      return 'md:col-span-2';
    }
    return 'col-span-1';
  };

  // Use the same image URL logic as TemplateThumbnail
  const getImageUrl = (image) => {
    if (!image || !image.url) return null;
    
    // Ensure URL is absolute
    if (image.url.startsWith('http')) {
      return image.url;
    } else {
      // Prepend base URL for relative URLs
      const baseURL = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:5000';
      return `${baseURL}${image.url}`;
    }
  };

  const getTemplateImage = (template) => {
    // Use the same logic as TemplateThumbnail
    const images = template.imageUrls || [];
    const hasImages = images.length > 0;
    
    if (hasImages) {
      const firstImage = images[0];
      return getImageUrl(firstImage);
    }
    
    // Fallback based on file type
    const isSpreadsheet = ['xlsx', 'xls', 'csv'].includes(template.fileExtension?.toLowerCase());
    return isSpreadsheet 
      ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop'
      : 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=500&fit=crop';
  };

  const hasPreviewImage = (template) => {
    const images = template.imageUrls || [];
    return images.length > 0 && images[0]?.url;
  };

  const handleImageError = (templateId) => {
    console.error(`❌ Failed to load image for template ${templateId}`);
    setImageErrors(prev => ({ ...prev, [templateId]: true }));
  };

  const handleImageLoad = (templateId) => {
    console.log(`✅ Successfully loaded image for template ${templateId}`);
    setImageErrors(prev => ({ ...prev, [templateId]: false }));
  };

  const toggleFavorite = async (templateId, e) => {
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

    try {
      const token = localStorage.getItem('token');
      const isCurrentlyFavorite = favorites.has(templateId);
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        await fetch(`http://localhost:5000/api/user/favorites/${templateId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
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
        // Add to favorites
        await fetch('http://localhost:5000/api/user/favorites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ templateId })
        });
        
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

  const handleEdit = (templateId, e) => {
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

    const userId = user?._id || user?.id;
    window.location.href = `/editor/${templateId}?user=${userId}`;
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-[95%] mx-auto px-2">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading templates...</p>
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
          </p>
        </motion.div>

        {/* Dynamic Grid with Better Spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {templates.map((template, index) => {
            const templateId = template._id;
            const hasImage = hasPreviewImage(template);
            const imageUrl = getTemplateImage(template);
            const hasError = imageErrors[templateId];

            return (
              <motion.div
                key={templateId}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className={`group relative cursor-pointer ${getGridColSpan(template.size, template.orientation)}`}
              >
                {/* Template Preview Container */}
                <div className={`${getSizeClasses(template.size, template.orientation)}`}>
                  {hasImage && !hasError ? (
                    <img
                      src={imageUrl}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={() => handleImageError(templateId)}
                      onLoad={() => handleImageLoad(templateId)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <span className="sr-only">No preview available</span>
                    </div>
                  )}
                  
                  {/* Hover Overlay with Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-500">
                    
                    {/* Top Right - Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(templateId, e)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0"
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites.has(templateId) ? 'fill-current text-red-500' : ''}`} 
                      />
                    </button>

                    {/* Bottom Right - Edit Button */}
                    <button
                      onClick={(e) => handleEdit(templateId, e)}
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Category Badge - Top Left */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full shadow-md">
                        {template.category?.name || 'Business'}
                      </span>
                    </div>

                    {/* File Type Badge - Bottom Left */}
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded-full shadow-md">
                        .{template.fileExtension || 'docx'}
                      </span>
                    </div>

                    {/* Center View Indicator */}
                    {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-white rounded-lg shadow-lg p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                      </div> */}
                    {/* </div> */}
                  </div>
                </div>

                {/* Template Name - Minimal Info */}
                <div className="mt-2">
                  <h3 className="font-medium text-gray-900 text-sm text-center line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Templates Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-12"
        >
          <Link to="/templates">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-500">
              Browse All Templates
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TemplatesSection;