const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

// @desc    Get all subcategories
// @route   GET /api/admin/subcategories
// @access  Private/Admin
exports.getSubCategories = async (req, res) => {
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

// @desc    Create a subcategory
// @route   POST /api/admin/subcategories
// @access  Private/Admin
exports.createSubCategory = async (req, res) => {
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

// @desc    Update a subcategory
// @route   PUT /api/admin/subcategories/:id
// @access  Private/Admin
exports.updateSubCategory = async (req, res) => {
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

// @desc    Delete a subcategory
// @route   DELETE /api/admin/subcategories/:id
// @access  Private/Admin
exports.deleteSubCategory = async (req, res) => {
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