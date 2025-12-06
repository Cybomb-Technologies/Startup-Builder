// controllers/category/createCategory.js
const Category = require('../../models/Category');

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
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

module.exports = createCategory;