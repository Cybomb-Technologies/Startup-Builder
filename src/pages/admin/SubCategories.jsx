import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const SubCategories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newSubCategory, setNewSubCategory] = useState({
    name: '',
    categoryId: ''
  });

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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('❌ Error parsing admin user data:', error);
      return {};
    }
  };

  // Load categories and subcategories
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesResponse = await fetch('http://localhost:5000/api/admin/categories', {
        headers: getAuthHeaders()
      });
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
        console.log('✅ Categories loaded:', categoriesData.categories?.length);
      } else {
        console.error('❌ Failed to load categories:', categoriesResponse.status);
      }

      // Load subcategories
      const subCategoriesResponse = await fetch('http://localhost:5000/api/admin/subcategories', {
        headers: getAuthHeaders()
      });
      
      if (subCategoriesResponse.ok) {
        const subCategoriesData = await subCategoriesResponse.json();
        setSubCategories(subCategoriesData.subCategories || []);
        console.log('✅ Subcategories loaded:', subCategoriesData.subCategories?.length);
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

  const handleCreateSubCategory = async () => {
    // 🎯 FIX: Better validation with detailed logging
    console.log('📤 Creating subcategory with data:', newSubCategory);
    
    if (!newSubCategory.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Subcategory name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!newSubCategory.categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }

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

      // 🎯 FIX: Use the exact field names expected by backend
      const requestBody = {
        name: newSubCategory.name.trim(),
        category: newSubCategory.categoryId  // 🎯 Changed from categoryId to category
      };

      console.log('📤 Sending request body:', requestBody);
      
      const response = await fetch('http://localhost:5000/api/admin/subcategories', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Create subcategory response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setSubCategories(prev => [...prev, data.subCategory]);
        setNewSubCategory({ name: '', categoryId: '' });
        toast({
          title: 'Success',
          description: 'Subcategory created successfully',
        });
        console.log('✅ Subcategory created:', data.subCategory);
      } else if (response.status === 401) {
        throw new Error('Authentication failed - Please login again');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subcategory');
      }
    } catch (error) {
      console.error('❌ Error creating subcategory:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSubCategory = async (id) => {
    if (!editValue.trim()) return;

    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) return;

      const response = await fetch(`http://localhost:5000/api/admin/subcategories/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: editValue.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubCategories(prev => prev.map(sub => 
          sub._id === id ? data.subCategory : sub
        ));
        setEditingId(null);
        setEditValue('');
        toast({
          title: 'Success',
          description: 'Subcategory updated successfully',
        });
      } else if (response.status === 401) {
        throw new Error('Authentication failed');
      } else {
        throw new Error('Failed to update subcategory');
      }
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) return;

      const response = await fetch(`http://localhost:5000/api/admin/subcategories/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setSubCategories(prev => prev.filter(sub => sub._id !== id));
        toast({
          title: 'Success',
          description: 'Subcategory deleted successfully',
        });
      } else if (response.status === 401) {
        throw new Error('Authentication failed');
      } else {
        throw new Error('Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startEditing = (subCategory) => {
    setEditingId(subCategory._id);
    setEditValue(subCategory.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-green-600" />
          SubCategories ({subCategories.length})
        </h2>
      </div>

      {/* Add New SubCategory */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Add New SubCategory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Category *
            </label>
            <select
              value={newSubCategory.categoryId}
              onChange={(e) => setNewSubCategory(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a Category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {!newSubCategory.categoryId && (
              <p className="text-red-500 text-xs mt-1">Please select a category</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SubCategory Name *
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newSubCategory.name}
                onChange={(e) => setNewSubCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter subcategory name"
                className="flex-1"
              />
              <Button 
                onClick={handleCreateSubCategory} 
                disabled={!newSubCategory.name.trim() || !newSubCategory.categoryId}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            {!newSubCategory.name.trim() && (
              <p className="text-red-500 text-xs mt-1">Subcategory name is required</p>
            )}
          </div>
        </div>
        
        {/* Debug info */}
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
          <p><strong>Debug:</strong> Selected Category ID: {newSubCategory.categoryId || 'None'}</p>
          <p><strong>Debug:</strong> SubCategory Name: {newSubCategory.name || 'None'}</p>
        </div>
      </div>

      {/* SubCategories List */}
      <div className="space-y-4">
        {subCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FolderTree className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No subcategories found</p>
            <p className="text-sm">Create your first subcategory to get started</p>
          </div>
        ) : (
          subCategories.map((subCategory) => (
            <div
              key={subCategory._id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {editingId === subCategory._id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdateSubCategory(subCategory._id)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FolderTree className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">{subCategory.name}</span>
                      <p className="text-sm text-gray-500">
                        under {getCategoryName(subCategory.category)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(subCategory)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSubCategory(subCategory._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default SubCategories;