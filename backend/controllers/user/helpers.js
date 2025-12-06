// helpers.js - Shared helper functions
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const User = require('../../models/User');
const Template = require('../../models/Template');
const UserAccess = require('../../models/UserAccess');

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

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-fallback-secret', { expiresIn: '30d' });
};

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

module.exports = {
  gridFSBucket,
  getContentType,
  generateToken,
  getAccessibleAccessLevels,
  canUserAccessTemplate
};