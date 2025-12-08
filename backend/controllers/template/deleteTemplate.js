// controllers/template/deleteTemplate.js
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

// @desc    Delete template and its file from MongoDB
// @route   DELETE /api/admin/templates/:id
// @access  Private/Admin
const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // console.log('🗑️ Deleting template:', {
    //   id: template._id,
    //   documentId: template.documentId,
    //   name: template.name
    // });

    // Delete file from GridFS if exists
    if (template.file && template.file.fileId) {
      try {
        await gridFSBucket.delete(template.file.fileId);
        // console.log('✅ File deleted from GridFS');
      } catch (error) {
        // console.log('⚠️ Could not delete file from GridFS:', error.message);
      }
    }

    // Delete all images from GridFS
    if (template.images && template.images.length > 0) {
      for (const image of template.images) {
        try {
          await gridFSBucket.delete(image.fileId);
          // console.log('✅ Image deleted from GridFS:', image.fileId);
        } catch (error) {
          // console.log('⚠️ Could not delete image from GridFS:', error.message);
        }
      }
    }

    await Template.findByIdAndDelete(req.params.id);

    // console.log('✅ Template deleted successfully:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template'
    });
  }
};

module.exports = deleteTemplate;