import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sample search suggestions
  const searchSuggestions = [
    "Business Plan",
    "Employment Contract", 
    "Invoice Template",
    "NDA Agreement",
    "Marketing Plan",
    "Resume Template",
    "Project Proposal",
    "Financial Report"
  ];

  // Typing animation effect
  useEffect(() => {
    const currentSuggestion = searchSuggestions[currentSuggestionIndex];
    
    if (!isDeleting && currentIndex < currentSuggestion.length) {
      // Typing forward
      const timeout = setTimeout(() => {
        setDisplayText(currentSuggestion.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100); // Typing speed
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentIndex > 0) {
      // Deleting
      const timeout = setTimeout(() => {
        setDisplayText(currentSuggestion.substring(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
      }, 50); // Deleting speed (faster)
      return () => clearTimeout(timeout);
    } else if (!isDeleting && currentIndex === currentSuggestion.length) {
      // Pause at the end of typing
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1500); // Pause before deleting
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentIndex === 0) {
      // Move to next suggestion after deleting
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentSuggestionIndex((prev) => 
          prev === searchSuggestions.length - 1 ? 0 : prev + 1
        );
      }, 500); // Pause before next suggestion
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, isDeleting, currentSuggestionIndex]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        
        if (response.ok) {
          const data = await response.json();
          const categoriesData = data.categories || data.data || data;
          setCategories(categoriesData);
        } else {
          // Fallback categories if API fails
          setCategories([
            { _id: '1', name: 'Business', icon: '📊' },
            { _id: '2', name: 'Legal', icon: '⚖️' },
            { _id: '3', name: 'Finance', icon: '💰' },
            { _id: '4', name: 'HR', icon: '👥' },
            { _id: '5', name: 'Marketing', icon: '📢' },
            { _id: '6', name: 'Operations', icon: '⚙️' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories
        setCategories([
          { _id: '1', name: 'Business', icon: '📊' },
          { _id: '2', name: 'Legal', icon: '⚖️' },
          { _id: '3', name: 'Finance', icon: '💰' },
          { _id: '4', name: 'HR', icon: '👥' },
          { _id: '5', name: 'Marketing', icon: '📢' },
          { _id: '6', name: 'Operations', icon: '⚙️' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to templates page with search query
      window.location.href = `/templates?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleCategoryClick = (categoryName) => {
    window.location.href = `/templates?category=${encodeURIComponent(categoryName)}`;
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 text-gray-900 py-16 md:py-24">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNzVGRiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            All Your Startup Documents in One Place
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-3xl mx-auto">
            Access, edit, and download 1000+ verified business templates instantly.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/templates">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
                Explore Templates
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white text-lg px-8 py-6 transition-all duration-300"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white text-lg px-8 py-6 transition-all duration-300"
                >
                  Start Free
                </Button>
              </Link>
            )}
          </div>

          {/* Global Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                 // placeholder="Search for templates..."
                  className="w-full pl-12 pr-16 py-4 rounded-2xl border border-gray-200 text-gray-900 text-lg shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                />
                <div className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  {displayText}
                  <span className="ml-1 animate-pulse">|</span>
                </div>
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all duration-300"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </form>
            {/* <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-blue-600 mt-3 text-sm font-medium"
            >
              Try searching for templates like "{searchSuggestions[currentSuggestionIndex]}"
            </motion.p> */}
          </motion.div>

          {/* Categories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Popular Categories
            </h3>
            
            {loading ? (
              <div className="flex justify-center gap-4 flex-wrap">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 bg-white/50 rounded-xl border border-gray-200 animate-pulse"
                  >
                    <div className="w-20 h-4 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center gap-3 flex-wrap">
                {categories.slice(0, 8).map((category, index) => (
                  <motion.button
                    key={category._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => handleCategoryClick(category.name)}
                    className="px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all duration-300 text-gray-700 font-medium hover:text-blue-600"
                  >
                    <span className="mr-2">{category.icon || '📄'}</span>
                    {category.name}
                  </motion.button>
                ))}
              </div>
            )}
            
            {categories.length > 8 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-4"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/templates'}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  View all categories
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full blur-xl opacity-40"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-200 rounded-full blur-xl opacity-30"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-200 rounded-full blur-xl opacity-50"></div>
    </section>
  );
};

export default HeroSection;