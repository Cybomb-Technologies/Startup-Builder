// controllers/template/getTemplateImage.js
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

// @desc    Get template image
// @route   GET /api/templates/:id/images/:imageId
// @access  Public
const getTemplateImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const { size } = req.query;

    console.log('📸 Getting template image:', { id, imageId, size });

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const image = template.images.find(img => img.fileId.toString() === imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Check if file exists in GridFS
    const files = await gridFSBucket.find({ _id: image.fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found in storage'
      });
    }

    const gridFSFile = files[0];

    // Set appropriate content type
    res.setHeader('Content-Type', image.fileType || 'image/jpeg');
    res.setHeader('Content-Length', gridFSFile.length);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Stream image from GridFS
    const downloadStream = gridFSBucket.openDownloadStream(image.fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('❌ Image download error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming image'
        });
      }
    });

  } catch (error) {
    console.error('❌ Get template image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving image: ' + error.message
    });
  }
};

module.exports = getTemplateImage;