// controllers/subCategory/updateSubCategory.js
const SubCategory = require('../../models/SubCategory');

// @desc    Update a subcategory
// @route   PUT /api/admin/subcategories/:id
// @access  Private/Admin
const updateSubCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    let subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    // Check if name is being changed and if it already exists in the same category
    if (name && name !== subCategory.name) {
      const existingSubCategory = await SubCategory.findOne({ 
        name, 
        category: subCategory.category 
      });
      if (existingSubCategory) {
        return res.status(400).json({
          success: false,
          message: 'Subcategory name already exists in this category'
        });
      }
    }

    subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true, runValidators: true }
    )
    .populate('category', 'name')
    .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Subcategory updated successfully',
      subCategory
    });
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subcategory'
    });
  }
};

module.exports = updateSubCategory;