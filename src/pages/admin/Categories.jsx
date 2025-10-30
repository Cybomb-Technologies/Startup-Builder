import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

// Auth functions directly in the component
const getAdminToken = () => {
  const token = localStorage.getItem('adminToken');
  if (token && token.startsWith('eyJ') && token.length > 100) {
    return token;
  }
  return null;
};

const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

const validateAdminSession = () => {
  const token = getAdminToken();
  const adminUser = localStorage.getItem('adminUser');
  if (!token || !adminUser) {
    adminLogout();
    return false;
  }
  return true;
};

const Categories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Get auth headers with validation
  const getAuthHeaders = () => {
    // Validate session first
    if (!validateAdminSession()) {
      return {};
    }

    const token = getAdminToken();
    
    if (!token) {
      console.error('❌ No valid admin token found');
      toast({
        title: 'Authentication Required',
        description: 'Please login to continue',
        variant: 'destructive',
      });
      setTimeout(() => {
        adminLogout();
      }, 2000);
      return {};
    }
    
    console.log('🔐 Using token for API request');
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Load categories from API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      // Check if headers are empty (no token)
      if (Object.keys(headers).length === 0) {
        setLoading(false);
        return;
      }

      console.log('📡 Loading categories from API...');
      
      const response = await fetch('http://localhost:5001/api/admin/categories', {
        headers
      });
      
      console.log('📡 Categories API Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        console.log('✅ Categories loaded successfully:', data.categories.length);
      } else if (response.status === 401) {
        console.log('❌ Unauthorized - clearing session');
        adminLogout();
        throw new Error('Session expired, please login again');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const headers = getAuthHeaders();
      
      // Check if headers are empty (no token)
      if (Object.keys(headers).length === 0) {
        return;
      }

      console.log('📤 Creating category:', newCategory);
      
      const response = await fetch('http://localhost:5001/api/admin/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          name: newCategory.trim(),
          description: ''
        }),
      });

      console.log('📡 Create category response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setCategories(prev => [...prev, data.category]);
        setNewCategory('');
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
        console.log('✅ Category created:', data.category);
      } else if (response.status === 401) {
        adminLogout();
        throw new Error('Session expired, please login again');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('❌ Error creating category:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // ... rest of your component code (update, delete functions)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-blue-600" />
          Main Categories ({categories.length})
        </h2>
      </div>

      {/* Add New Category */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Add New Category</h3>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleCreateCategory();
            }}
          />
          <Button 
            onClick={handleCreateCategory} 
            disabled={!newCategory.trim()}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No categories found</p>
            <p className="text-sm">Create your first category to get started</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category._id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(category._id);
                    setEditValue(category.name);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (!confirm('Are you sure you want to delete this category?')) return;
                    // Add delete functionality here
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Categories;