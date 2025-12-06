// controllers/template/getTemplateFileInfo.js
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

// @desc    Get template file info (for debugging)
// @route   GET /api/admin/templates/:id/file-info
// @access  Private/Admin
const getTemplateFileInfo = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    let fileExists = false;
    let fileInfo = null;
    
    if (template.file && template.file.fileId) {
      const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
      fileExists = files.length > 0;
      fileInfo = files[0] || null;
    }

    res.status(200).json({
      success: true,
      template: {
        id: template._id,
        documentId: template.documentId,
        name: template.name,
        file: template.file,
        fileExistsInGridFS: fileExists,
        gridFSFileInfo: fileInfo
      }
    });
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file info'
    });
  }
};

module.exports = getTemplateFileInfo;