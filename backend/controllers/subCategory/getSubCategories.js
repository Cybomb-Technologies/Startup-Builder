// controllers/subCategory/getSubCategories.js
const SubCategory = require('../../models/SubCategory');

// @desc    Get all subcategories
// @route   GET /api/admin/subcategories
// @access  Private/Admin
const getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subCategories.length,
      subCategories
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subcategories'
    });
  }
};

module.exports = getSubCategories;