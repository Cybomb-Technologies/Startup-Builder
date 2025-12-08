// controllers/template/reorderImages.js
const Template = require('../../models/Template');

// @desc    Reorder images
// @route   PUT /api/admin/templates/:id/images/reorder
// @access  Private/Admin
const reorderImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageOrder } = req.body;

    // console.log('🔄 Reordering images:', { id, imageOrder });

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Update order for each image
    imageOrder.forEach(({ imageId, order }) => {
      const image = template.images.find(img => img.fileId.toString() === imageId);
      if (image) {
        image.order = order;
      }
    });

    // Sort images by order
    template.images.sort((a, b) => a.order - b.order);

    await template.save();

    // console.log('✅ Images reordered');

    // Populate the updated template
    const updatedTemplate = await Template.findById(template._id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Images reordered successfully',
      template: updatedTemplate
    });

  } catch (error) {
    console.error('❌ Reorder images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering images: ' + error.message
    });
  }
};

module.exports = reorderImages;