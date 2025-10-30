const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Template = require('../models/Template');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
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

// REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email,
        plan: newUser.plan 
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        plan: user.plan 
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DOWNLOAD TEMPLATE (PROTECTED ROUTE)
router.get('/templates/:id/download', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('accessLevel', 'name');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (!template.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Template not available'
      });
    }

    // Check user access level
    const userPlan = req.user.plan || 'Free';
    const requiredPlan = template.accessLevel?.name || 'Free';
    
    const planHierarchy = { 'Free': 0, 'Pro': 1, 'Business': 2 };
    
    if (planHierarchy[userPlan] < planHierarchy[requiredPlan]) {
      return res.status(403).json({
        success: false,
        message: 'Your plan does not have access to this template'
      });
    }

    // Check if file exists in GridFS
    if (!template.file || !template.file.fileId) {
      return res.status(404).json({
        success: false,
        message: 'Template file not found'
      });
    }

    const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found in storage'
      });
    }

    const gridFSFile = files[0];

    // Update download count
    template.downloadCount = (template.downloadCount || 0) + 1;
    await template.save();

    // Get correct file extension from the actual file
    const originalFileName = gridFSFile.filename;
    const fileExtension = originalFileName.split('.').pop().toLowerCase();
    const filename = `${template.name.replace(/\s+/g, '_')}.${fileExtension}`;
    
    // Set correct content type based on file extension
    const contentType = getContentType(fileExtension);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', gridFSFile.length);
    res.setHeader('Cache-Control', 'no-cache');

    // Stream file from GridFS
    const downloadStream = gridFSBucket.openDownloadStream(template.file.fileId);
    downloadStream.pipe(res);
    
    downloadStream.on('error', (error) => {
      console.error('File download error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });

  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading template'
    });
  }
});

// GET TEMPLATE PREVIEW DATA (ENHANCED)
router.get('/templates/:id/preview', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('category', 'name icon')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check user access level
    const userPlan = req.user.plan || 'Free';
    const requiredPlan = template.accessLevel?.name || 'Free';
    
    const planHierarchy = { 'Free': 0, 'Pro': 1, 'Business': 2 };
    
    if (planHierarchy[userPlan] < planHierarchy[requiredPlan]) {
      return res.status(403).json({
        success: false,
        message: 'Your plan does not have access to this template'
      });
    }

    // Get actual file info from GridFS with enhanced detection
    let actualFileInfo = null;
    let detectedFileExtension = 'docx'; // Default fallback

    if (template.file && template.file.fileId) {
      const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
      if (files.length > 0) {
        const gridFSFile = files[0];
        
        // Extract file extension from filename
        const fileName = gridFSFile.filename;
        const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
        const fileExtension = extensionMatch ? extensionMatch[1].toLowerCase() : 'docx';
        
        // Validate extension
        const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
        detectedFileExtension = validExtensions.includes(fileExtension) ? fileExtension : 'docx';
        
        actualFileInfo = {
          fileName: gridFSFile.filename,
          fileSize: gridFSFile.length,
          actualFileType: detectedFileExtension,
          uploadDate: gridFSFile.uploadDate
        };
      }
    }

    // Enhanced file type detection from multiple sources
    let finalFileExtension = detectedFileExtension;
    
    // Check template's fileType field
    if (template.fileType && finalFileExtension === 'docx') {
      const templateFileType = template.fileType.replace('.', '').toLowerCase();
      const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
      if (validExtensions.includes(templateFileType)) {
        finalFileExtension = templateFileType;
      }
    }

    // Check file object fileType
    if (template.file?.fileType && finalFileExtension === 'docx') {
      const fileObjectType = template.file.fileType.replace('.', '').toLowerCase();
      const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
      if (validExtensions.includes(fileObjectType)) {
        finalFileExtension = fileObjectType;
      }
    }

    res.json({
      success: true,
      template: {
        id: template._id,
        name: template.name,
        description: template.description,
        category: template.category,
        subCategory: template.subCategory,
        accessLevel: template.accessLevel,
        fileType: finalFileExtension, // Use detected file extension
        fileExtension: finalFileExtension, // Add explicit fileExtension field
        fileSize: actualFileInfo?.fileSize || template.file?.fileSize,
        downloadCount: template.downloadCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        tags: template.tags,
        hasFile: !!(template.file && template.file.fileId),
        actualFileInfo: actualFileInfo
      }
    });
  } catch (error) {
    console.error('Preview template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template preview'
    });
  }
});

// GET ALL TEMPLATES WITH ENHANCED FILE DETECTION
router.get('/templates', async (req, res) => {
  try {
    const templates = await Template.find({ isActive: true })
      .populate('category', 'name icon')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .sort({ createdAt: -1 });

    // Enhance templates with file extension detection
    const enhancedTemplates = await Promise.all(
      templates.map(async (template) => {
        let fileExtension = 'docx'; // Default fallback
        
        // Try to get actual file info from GridFS first
        if (template.file && template.file.fileId) {
          try {
            const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
            if (files.length > 0) {
              const gridFSFile = files[0];
              const fileName = gridFSFile.filename;
              const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
              if (extensionMatch) {
                const ext = extensionMatch[1].toLowerCase();
                const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
                if (validExtensions.includes(ext)) {
                  fileExtension = ext;
                }
              }
            }
          } catch (error) {
            console.warn(`Could not get file info for template ${template._id}:`, error.message);
          }
        }

        // Fallback to template fileType if GridFS fails
        if (fileExtension === 'docx' && template.fileType) {
          const templateFileType = template.fileType.replace('.', '').toLowerCase();
          const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
          if (validExtensions.includes(templateFileType)) {
            fileExtension = templateFileType;
          }
        }

        // Convert to plain object and add fileExtension
        const templateObj = template.toObject();
        templateObj.fileExtension = fileExtension;
        
        return templateObj;
      })
    );

    res.json({
      success: true,
      templates: enhancedTemplates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates'
    });
  }
});

// GET USER PROFILE
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        plan: req.user.plan
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper function to get content type based on file extension
function getContentType(fileExtension) {
  const contentTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'rtf': 'application/rtf',
    'zip': 'application/zip',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif'
  };
  
  return contentTypes[fileExtension] || 'application/octet-stream';
}

module.exports = router;