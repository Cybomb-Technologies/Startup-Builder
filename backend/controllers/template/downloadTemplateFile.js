// controllers/template/downloadTemplateFile.js
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

// @desc    Download template file from MongoDB
// @route   GET /api/admin/templates/:id/download
// @access  Private/Admin
const downloadTemplateFile = async (req, res) => {
  try {
    console.log('📥 Download request for template:', req.params.id);
    
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (!template.file || !template.file.fileId) {
      return res.status(404).json({
        success: false,
        message: 'No file attached to this template'
      });
    }

    // Check if file exists in GridFS
    const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found in storage'
      });
    }

    // Increment download count
    template.downloadCount += 1;
    await template.save();

    console.log('✅ Streaming file download:', {
      fileName: template.file.fileName,
      fileSize: template.file.fileSize
    });

    // Set headers
    res.setHeader('Content-Type', template.file.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${template.file.fileName}"`);
    res.setHeader('Content-Length', template.file.fileSize);
    res.setHeader('Cache-Control', 'no-cache');

    // Stream file from GridFS
    const downloadStream = gridFSBucket.openDownloadStream(template.file.fileId);
    
    downloadStream.pipe(res);
    
    downloadStream.on('error', (error) => {
      console.error('❌ File download stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file stream'
        });
      }
    });

  } catch (error) {
    console.error('❌ Download template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file: ' + error.message
    });
  }
};

module.exports = downloadTemplateFile;