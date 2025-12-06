// controllers/template/deleteTemplateImage.js
const Template = require('../../models/Template');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gridFSBucket;
const initializeGridFS = () => {
  const db = mongoose.connection.db;
  gridFSBucket = new GridFSBucket(db, {
    bucketName: 'files'
  });
};

mongoose.connection.on('connected', () => {
  initializeGridFS();
});

// @desc    Delete template image
// @route   DELETE /api/admin/templates/:id/images/:imageId
// @access  Private/Admin
const deleteTemplateImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    console.log('🗑️ Deleting template image:', { id, imageId });

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const imageIndex = template.images.findIndex(img => img.fileId.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const image = template.images[imageIndex];
    const wasPrimary = image.isPrimary;

    // Delete from GridFS
    try {
      await gridFSBucket.delete(image.fileId);
      console.log('✅ Image deleted from GridFS');
    } catch (error) {
      console.log('⚠️ Could not delete image from GridFS:', error.message);
    }

    // Remove from template images array
    template.images.splice(imageIndex, 1);

    // If deleted image was primary, set a new primary
    if (wasPrimary && template.images.length > 0) {
      template.images[0].isPrimary = true;
    }

    await template.save();

    console.log('✅ Image deleted from template');

    // Populate the updated template
    const updatedTemplate = await Template.findById(template._id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      template: updatedTemplate
    });

  } catch (error) {
    console.error('❌ Delete template image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image: ' + error.message
    });
  }
};

module.exports = deleteTemplateImage;