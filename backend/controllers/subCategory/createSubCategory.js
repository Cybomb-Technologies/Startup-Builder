// controllers/subCategory/createSubCategory.js
const SubCategory = require('../../models/SubCategory');
const Category = require('../../models/Category');

// @desc    Create a subcategory
// @route   POST /api/admin/subcategories
// @access  Private/Admin
const createSubCategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory name and category are required'
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if subcategory already exists in this category
    const existingSubCategory = await SubCategory.findOne({ name, category });
    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory already exists in this category'
      });
    }

    const subCategory = await SubCategory.create({
      name,
      category,
      description,
      createdBy: req.admin._id
    });

    await subCategory.populate('category', 'name');
    await subCategory.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      subCategory
    });
  } catch (error) {
    console.error('Create subcategory error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory already exists in this category'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating subcategory'
    });
  }
};

module.exports = createSubCategory;