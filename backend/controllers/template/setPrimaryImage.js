// controllers/template/setPrimaryImage.js
const Template = require('../../models/Template');

// @desc    Set primary image
// @route   PUT /api/admin/templates/:id/images/:imageId/primary
// @access  Private/Admin
const setPrimaryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // console.log('⭐ Setting primary image:', { id, imageId });

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Reset all images to not primary
    template.images.forEach(img => {
      img.isPrimary = img.fileId.toString() === imageId;
    });

    await template.save();

    // console.log('✅ Primary image set');

    // Populate the updated template
    const updatedTemplate = await Template.findById(template._id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Primary image set successfully',
      template: updatedTemplate
    });

  } catch (error) {
    console.error('❌ Set primary image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting primary image: ' + error.message
    });
  }
};

module.exports = setPrimaryImage;