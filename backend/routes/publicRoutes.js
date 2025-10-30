const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const FileType = require('../models/FileType');
const UserAccess = require('../models/UserAccess');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// Initialize GridFS bucket
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

// Helper function to detect file extension from GridFS
async function detectFileExtension(template) {
  if (!template.file || !template.file.fileId) {
    return 'docx'; // Default fallback
  }

  try {
    const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
    if (files.length > 0) {
      const gridFSFile = files[0];
      const fileName = gridFSFile.filename;
      const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
      if (extensionMatch) {
        const fileExtension = extensionMatch[1].toLowerCase();
        // Validate extension
        const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
        return validExtensions.includes(fileExtension) ? fileExtension : 'docx';
      }
    }
  } catch (error) {
    console.warn(`Could not detect file extension for template ${template._id}:`, error.message);
  }

  return 'docx'; // Default fallback
}

// ==================== PUBLIC IMAGE ROUTES ====================

// @desc    Get template image (PUBLIC ACCESS)
// @route   GET /api/templates/:id/images/:imageId
// @access  Public
router.get('/templates/:id/images/:imageId', async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const { size } = req.query;

    console.log('📸 Getting template image (Public Route):', { id, imageId, size });

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
});

// @desc    Get template image thumbnail (PUBLIC ACCESS)
// @route   GET /api/templates/:id/images/:imageId/thumbnail
// @access  Public
router.get('/templates/:id/images/:imageId/thumbnail', async (req, res) => {
  try {
    const { id, imageId } = req.params;

    console.log('📸 Getting template thumbnail (Public Route):', { id, imageId });

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

    // For now, return the original image (you can add thumbnail generation logic later)
    const downloadStream = gridFSBucket.openDownloadStream(image.fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('❌ Thumbnail download error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming thumbnail'
        });
      }
    });

  } catch (error) {
    console.error('❌ Get template thumbnail error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving thumbnail: ' + error.message
    });
  }
});

// ==================== EXISTING PUBLIC ROUTES ====================

// @desc    Get all active templates (public) - ENHANCED WITH FILE EXTENSION DETECTION
// @route   GET /api/templates
// @access  Public
router.get('/templates', async (req, res) => {
  try {
    console.log('📥 Fetching public templates...');
    
    const templates = await Template.find({ isActive: true })
      .populate('category', 'name icon')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .select('-content -createdBy -__v') // REMOVED -file from select to include file data
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${templates.length} templates`);

    // Enhance templates with file extension detection
    const enhancedTemplates = await Promise.all(
      templates.map(async (template) => {
        const templateObj = template.toObject();
        
        // Detect file extension
        const fileExtension = await detectFileExtension(template);
        
        // Add file extension and file info to template
        templateObj.fileExtension = fileExtension;
        templateObj.hasFile = !!(template.file && template.file.fileId);
        
        return templateObj;
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedTemplates.length,
      templates: enhancedTemplates
    });
  } catch (error) {
    console.error('❌ Get public templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates'
    });
  }
});

// @desc    Get all active categories (public)
// @route   GET /api/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    console.log('📥 Fetching public categories...');
    
    const categories = await Category.find({ isActive: true })
      .select('name icon isActive')
      .sort({ name: 1 });

    console.log(`✅ Found ${categories.length} categories`);

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('❌ Get public categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @desc    Get all active subcategories (public)
// @route   GET /api/subcategories
// @access  Public
router.get('/subcategories', async (req, res) => {
  try {
    console.log('📥 Fetching public subcategories...');
    
    const subcategories = await SubCategory.find({ isActive: true })
      .populate('category', 'name')
      .select('name category isActive')
      .sort({ name: 1 });

    console.log(`✅ Found ${subcategories.length} subcategories`);

    res.status(200).json({
      success: true,
      count: subcategories.length,
      subcategories
    });
  } catch (error) {
    console.error('❌ Get public subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subcategories'
    });
  }
});

// @desc    Get all active file types (public)
// @route   GET /api/file-types
// @access  Public
router.get('/file-types', async (req, res) => {
  try {
    console.log('📥 Fetching public file types...');
    
    const fileTypes = await FileType.find({ isActive: true })
      .select('name extension isActive')
      .sort({ name: 1 });

    console.log(`✅ Found ${fileTypes.length} file types`);

    res.status(200).json({
      success: true,
      count: fileTypes.length,
      fileTypes
    });
  } catch (error) {
    console.error('❌ Get public file types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file types'
    });
  }
});

// @desc    Get all active access levels (public)
// @route   GET /api/access-levels
// @access  Public
router.get('/access-levels', async (req, res) => {
  try {
    console.log('📥 Fetching public access levels...');
    
    const accessLevels = await UserAccess.find({ isActive: true })
      .select('name isActive')
      .sort({ name: 1 });

    console.log(`✅ Found ${accessLevels.length} access levels`);

    res.status(200).json({
      success: true,
      count: accessLevels.length,
      accessLevels
    });
  } catch (error) {
    console.error('❌ Get public access levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching access levels'
    });
  }
});

module.exports = router;