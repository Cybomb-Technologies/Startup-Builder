// controllers/template/deleteTemplateFile.js
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

// @desc    Delete only the file from template
// @route   DELETE /api/admin/templates/:id/file
// @access  Private/Admin
const deleteTemplateFile = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (!template.file || !template.file.fileId) {
      return res.status(400).json({
        success: false,
        message: 'No file attached to this template'
      });
    }

    // console.log('🗑️ Deleting file from template:', {
    //   templateId: template._id,
    //   fileId: template.file.fileId
    // });

    // Delete file from GridFS
    await gridFSBucket.delete(template.file.fileId);

    // Remove file data from template
    template.file = null;
    await template.save();

    // console.log('✅ File deleted from template:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      template
    });

  } catch (error) {
    console.error('Delete template file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
};

module.exports = deleteTemplateFile;