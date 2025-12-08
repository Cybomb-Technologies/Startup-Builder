// downloadTemplateFile.js - FIXED VERSION
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Template = require('../../models/Template');
const User = require('../../models/User');
const UserAccess = require('../../models/UserAccess');

// Initialize GridFS bucket
let gridFSBucket;
const initializeGridFS = () => {
  if (mongoose.connection.db) {
    gridFSBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'files'
    });
  }
};

// Ensure GridFS is initialized
if (mongoose.connection.readyState === 1) {
  initializeGridFS();
} else {
  mongoose.connection.once('connected', () => {
    initializeGridFS();
  });
}

// Helper function to get content type
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

// Get accessible access levels based on user's plan
const getAccessibleAccessLevels = async (userPlanId) => {
  console.log('🔍 Getting accessible access levels for plan:', userPlanId);
  
  // Define access hierarchy
  const accessHierarchy = {
    'free': ['free'],
    'pro': ['free', 'pro'],
    'business': ['free', 'pro', 'business'],
    'enterprise': ['free', 'pro', 'business', 'enterprise']
  };

  const allowedAccessNames = accessHierarchy[userPlanId] || ['free'];
  console.log('📋 Allowed access names:', allowedAccessNames);

  // Get access level IDs for these names
  const accessibleAccessLevels = await UserAccess.find({
    name: { $in: allowedAccessNames }
  }).select('_id name');

  console.log('📋 Accessible access levels:', accessibleAccessLevels.map(a => ({ id: a._id, name: a.name })));
  
  return accessibleAccessLevels.map(access => access._id);
};

// Check if user can access specific template
const canUserAccessTemplate = async (userId, templateId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    const template = await Template.findById(templateId).populate('accessLevel', 'name');
    if (!template || !template.isActive) return false;

    const accessibleAccessLevels = await getAccessibleAccessLevels(user.planId);
    
    const hasAccess = accessibleAccessLevels.some(accessId => 
      accessId.toString() === template.accessLevel._id.toString()
    );

    console.log('🔐 Access check:', {
      userId: user._id,
      userPlanId: user.planId,
      templateId: template._id,
      templateAccessLevel: template.accessLevel?.name,
      accessibleAccessLevels: accessibleAccessLevels.map(id => id.toString()),
      hasAccess
    });

    return hasAccess;
  } catch (error) {
    console.error('❌ Error checking template access:', error);
    return false;
  }
};

exports.downloadTemplateFile = async (req, res) => {
  try {
    console.log('📥 Download request for template:', req.params.id);
    console.log('👤 User ID:', req.user.id);

    const template = await Template.findById(req.params.id)
      .populate('accessLevel', 'name');

    if (!template) {
      console.error('❌ Template not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (!template.isActive) {
      console.error('❌ Template not active:', template.name);
      return res.status(404).json({
        success: false,
        message: 'Template not available'
      });
    }

    console.log('🔍 Found template:', template.name);

    // Check if user can access this template
    const canAccess = await canUserAccessTemplate(req.user.id, req.params.id);
    if (!canAccess) {
      console.error('❌ Access denied for user:', req.user.id, 'to template:', template.name);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Upgrade your plan to access this template.'
      });
    }

    console.log('✅ User has access to template');

    // Check if file exists in GridFS
    if (!template.file || !template.file.fileId) {
      console.error('❌ Template file not found in database:', template.name);
      return res.status(404).json({
        success: false,
        message: 'Template file not found'
      });
    }

    console.log('📄 Template file ID:', template.file.fileId);

    // Ensure GridFS is initialized
    if (!gridFSBucket) {
      initializeGridFS();
      if (!gridFSBucket) {
        throw new Error('GridFS bucket not initialized');
      }
    }

    const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
    if (files.length === 0) {
      console.error('❌ File not found in GridFS storage:', template.file.fileId);
      return res.status(404).json({
        success: false,
        message: 'File not found in storage'
      });
    }

    const gridFSFile = files[0];
    console.log('✅ File found in GridFS:', gridFSFile.filename, 'Size:', gridFSFile.length);

    const originalFileName = gridFSFile.filename;
    const fileExtension = originalFileName.split('.').pop().toLowerCase();
    const filename = `${template.name.replace(/\s+/g, '_')}.${fileExtension}`;
    
    const contentType = getContentType(fileExtension);
    
    console.log('📥 Preparing download:', {
      filename: filename,
      contentType: contentType,
      fileSize: gridFSFile.length
    });

    // Update download count
    template.downloadCount = (template.downloadCount || 0) + 1;
    await template.save();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', gridFSFile.length);
    res.setHeader('Cache-Control', 'no-cache');

    console.log('✅ Headers set, streaming file...');

    // Stream file from GridFS
    const downloadStream = gridFSBucket.openDownloadStream(template.file.fileId);
    
    downloadStream.on('error', (error) => {
      console.error('❌ File download stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      } else {
        res.end();
      }
    });

    downloadStream.on('end', () => {
      console.log('✅ File download completed successfully');
    });

    downloadStream.pipe(res);

  } catch (error) {
    console.error('❌ Download template error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // If headers already sent, just end the response
    if (res.headersSent) {
      return res.end();
    }
    
    res.status(500).json({
      success: false,
      message: 'Error downloading template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};