// controllers/template/getTemplates.js
const Template = require('../../models/Template');

// @desc    Get all templates
// @route   GET /api/admin/templates
// @access  Private/Admin
const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find()
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Enhance templates with image URLs
    const enhancedTemplates = templates.map(template => {
      const templateObj = template.toObject();
      if (template.images && template.images.length > 0) {
        templateObj.imageUrls = template.images.map(img => ({
          url: `/api/templates/${template._id}/images/${img.fileId}`,
          thumbnail: `/api/templates/${template._id}/images/${img.fileId}?size=thumbnail`,
          ...img.toObject ? img.toObject() : img
        }));
      } else {
        templateObj.imageUrls = [];
      }
      return templateObj;
    });

    res.status(200).json({
      success: true,
      count: enhancedTemplates.length,
      templates: enhancedTemplates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates'
    });
  }
};

module.exports = getTemplates;