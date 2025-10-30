const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getCategories = async (req, res) => {
  try {
    console.log('=== GET CATEGORIES REQUEST ===');
    console.log('Admin:', req.admin ? req.admin._id : 'No admin');

    const categories = await Category.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    console.log('=== CREATE CATEGORY REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Admin user:', req.admin);
    console.log('Headers:', req.headers);

    const { name, description } = req.body;

    if (!name) {
      console.log('Validation failed: Name required');
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      console.log('Category already exists:', name);
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    // Check admin authentication
    if (!req.admin || !req.admin._id) {
      console.log('No admin found in request');
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    console.log('Creating category with admin:', req.admin._id);
    
    const category = await Category.create({
      name,
      description,
      createdBy: req.admin._id
    });

    await category.populate('createdBy', 'name email');

    console.log('Category created successfully:', category._id);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('❌ CREATE CATEGORY ERROR:', error);
    console.error('Error stack:', error.stack);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating category: ' + error.message
    });
  }
};

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has subcategories
    const subCategoriesCount = await SubCategory.countDocuments({ category: req.params.id });
    
    if (subCategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing subcategories'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
};