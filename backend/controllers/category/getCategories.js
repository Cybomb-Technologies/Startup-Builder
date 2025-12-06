// controllers/category/getCategories.js
const Category = require('../../models/Category');

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
const getCategories = async (req, res) => {
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

module.exports = getCategories;