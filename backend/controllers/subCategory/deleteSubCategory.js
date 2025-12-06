// controllers/subCategory/deleteSubCategory.js
const SubCategory = require('../../models/SubCategory');

// @desc    Delete a subcategory
// @route   DELETE /api/admin/subcategories/:id
// @access  Private/Admin
const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    await SubCategory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subcategory'
    });
  }
};

module.exports = deleteSubCategory;