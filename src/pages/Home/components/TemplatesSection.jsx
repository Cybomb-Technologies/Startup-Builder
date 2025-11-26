import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Edit3, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const TemplatesSection = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  // Fetch categories and templates dynamically
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesResponse = await fetch('http://localhost:5000/api/categories?limit=5');
        
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const categoriesData = await categoriesResponse.json();
        const categoriesList = categoriesData.categories || categoriesData.data || categoriesData;
        
        if (!categoriesList || categoriesList.length === 0) {
          throw new Error('No categories found');
        }

        setCategories(categoriesList.slice(0, 5));

        // Fetch templates for each category with proper filtering
        const templatesByCategory = {};
        
        for (const category of categoriesList.slice(0, 5)) {
          try {
            const templatesResponse = await fetch(`http://localhost:5000/api/templates?category=${category._id}&limit=5`);
            
            if (templatesResponse.ok) {
              const templatesData = await templatesResponse.json();
              const categoryTemplates = templatesData.templates || templatesData.data || templatesData || [];
              
              // Ensure templates belong to this specific category
              const filteredTemplates = categoryTemplates.filter(template => 
                template.category?._id === category._id || template.category === category._id
              );
              
              templatesByCategory[category._id] = filteredTemplates.slice(0, 5);
            } else {
              console.warn(`Failed to fetch templates for category ${category.name}`);
              templatesByCategory[category._id] = [];
            }
          } catch (error) {
            console.error(`Error fetching templates for category ${category.name}:`, error);
            templatesByCategory[category._id] = [];
          }
        }
        
        setTemplates(templatesByCategory);
        
      } catch (error) {
        console.error('Error fetching data:', error);
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

  const getTemplateImage = (template) => {
    // Try different possible image URL fields
    const imageUrl = template.imageUrls?.[0]?.url || 
                    template.images?.[0]?.url || 
                    template.previewImages?.[0] || 
                    template.image ||
                    template.thumbnail;
    
    if (imageUrl && typeof imageUrl === 'string') {
      return imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;
    }
    
    // Return a generic placeholder if no image available
    return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&h=400&fit=crop';
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
              <Edit3 className="w-8 h-8 text-gray-400" />
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
          </p>
        </motion.div>

        {/* Categories with Templates - No Labels */}
        <div className="space-y-8">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              {/* Category Header - Minimal */}
              <div className="flex items-center justify-between mb-4">
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

              {/* Templates Grid - Larger Templates */}
              {templates[category._id] && templates[category._id].length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {templates[category._id].map((template, templateIndex) => (
                    <motion.div
                      key={template._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: templateIndex * 0.1 }}
                      className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer"
                      onMouseEnter={() => setHoveredTemplate(template._id)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                    >
                      {/* Template Image - Larger Size */}
                      <div className="relative h-80 overflow-hidden">
                        <img
                          src={getTemplateImage(template)}
                          alt={template.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Template Name Overlay - Only on Hover */}
                        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-all duration-300 ${
                          hoveredTemplate === template._id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}>
                          <h4 className="font-semibold text-white text-lg line-clamp-2 text-center">
                            {template.name}
                          </h4>
                        </div>
                        
                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
                          {/* Favorite Button */}
                          <button
                            onClick={(e) => toggleFavorite(template._id, e)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <Heart 
                              className={`w-5 h-5 ${favorites.has(template._id) ? 'fill-current text-red-500' : ''}`} 
                            />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={(e) => handleEdit(template._id, e)}
                            className="absolute top-4 left-4 p-2 rounded-full bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>

                          {/* File Type Badge */}
                          <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full shadow-lg">
                              .{template.fileExtension || 'docx'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
          className="text-center mt-8"
        >
          <Link to="/templates">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
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