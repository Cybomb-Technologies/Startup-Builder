const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const User = require('../models/User');
const Template = require('../models/Template');
const UserDocument = require('../models/UserDocument');
const Otp = require('../models/Otp');
const Payment = require('../models/Payment');
const PricingPlan = require('../models/PricingPlan');
const sendEmail = require('../utils/emailService');
const { generateNumericOTP, hashOtp, compareOtp } = require('../utils/otp');

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

// ✅ REGISTER USER
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email 
      },
      process.env.JWT_SECRET || 'your-fallback-secret',
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
        plan: newUser.plan,
        planId: newUser.planId,
        isPremium: newUser.isPremium
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// ✅ LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    let isPasswordValid;
    if (typeof user.comparePassword === 'function') {
      isPasswordValid = await user.comparePassword(password);
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name || user.username,
        plan: user.plan,
        planId: user.planId,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        planExpiryDate: user.planExpiryDate
      },
      token: token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

// ✅ TOKEN VALIDATION
exports.validateToken = async (req, res) => {
  try {
    console.log('✅ TOKEN VALIDATION: Token is valid for user:', req.user.email);
    
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        plan: req.user.plan || 'Free',
        planId: req.user.planId || 'free',
        isPremium: req.user.isPremium || false,
        subscriptionStatus: req.user.subscriptionStatus || 'inactive',
        planExpiryDate: req.user.planExpiryDate
      }
    });
  } catch (error) {
    console.error('❌ TOKEN VALIDATION ERROR:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// ✅ GET USER DOCUMENTS
exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await UserDocument.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .populate('originalTemplate', 'name category fileType')
      .lean();

    // Filter to show only template-based documents (hide empty documents)
    const templateDocuments = documents.filter(doc => doc.originalTemplate);

    res.json({
      success: true,
      documents: templateDocuments.map(doc => ({
        _id: doc._id,
        name: doc.name,
        file: doc.file,
        updatedAt: doc.updatedAt,
        originalTemplate: doc.originalTemplate,
        documentType: doc.documentType,
        createdAt: doc.createdAt
      })),
      downloadCount: templateDocuments.length
    });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents'
    });
  }
};

// ✅ GET USER STATISTICS
exports.getUserStats = async (req, res) => {
  try {
    // Only count template-based documents
    const documents = await UserDocument.find({ 
      user: req.user.id,
      originalTemplate: { $exists: true, $ne: null }
    });
    
    const totalDocuments = documents.length;
    
    // Calculate unique projects (group by template)
    const uniqueProjects = new Set(
      documents.map(doc => doc.originalTemplate.toString())
    ).size;

    res.json({
      success: true,
      stats: {
        totalDocuments,
        projects: uniqueProjects || totalDocuments,
        downloads: totalDocuments,
        recentActivity: documents.slice(0, 5).map(doc => ({
          id: doc._id,
          name: doc.name,
          type: 'template',
          action: 'created',
          timestamp: doc.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// ✅ DOWNLOAD TEMPLATE AND CREATE DOCUMENT
exports.downloadTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if user already has a document for this template
    let userDoc = await UserDocument.findOne({
      user: req.user.id,
      originalTemplate: req.params.id
    });

    // If no user document exists, create one
    if (!userDoc) {
      console.log(`📄 Creating user document for template ${template.name} for user ${req.user.email}`);

      const source = gridFSBucket.openDownloadStream(template.file.fileId);
      const upload = gridFSBucket.openUploadStream(template.file.fileName);
      source.pipe(upload);

      const newFile = await new Promise((resolve, reject) => {
        upload.on("finish", resolve);
        upload.on("error", reject);
      });

      userDoc = await UserDocument.create({
        user: req.user.id,
        originalTemplate: req.params.id,
        name: `${template.name} (My Copy)`,
        file: {
          fileId: newFile._id,
          fileName: template.file.fileName
        },
        documentType: 'template'
      });

      console.log(`✅ User document created: ${userDoc._id}`);
    }

    // Return the file for download
    const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found in storage'
      });
    }

    const gridFSFile = files[0];
    const originalFileName = gridFSFile.filename;
    const fileExtension = originalFileName.split('.').pop().toLowerCase();
    const filename = `${template.name.replace(/\s+/g, '_')}.${fileExtension}`;
    
    const contentType = getContentType(fileExtension);
    
    // Update download count
    template.downloadCount = (template.downloadCount || 0) + 1;
    await template.save();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', gridFSFile.length);
    res.setHeader('Cache-Control', 'no-cache');

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
};

// ✅ GET SINGLE USER DOCUMENT
exports.getUserDocument = async (req, res) => {
  try {
    const document = await UserDocument.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('originalTemplate', 'name category fileType');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error fetching user document:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document'
    });
  }
};

// ✅ UPDATE USER DOCUMENT
exports.updateUserDocument = async (req, res) => {
  try {
    const { name } = req.body;
    
    const document = await UserDocument.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        name,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('originalTemplate', 'name category fileType');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Error updating user document:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document'
    });
  }
};

// ✅ DELETE USER DOCUMENT
exports.deleteUserDocument = async (req, res) => {
  try {
    const document = await UserDocument.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Optional: Delete the associated file from GridFS
    if (document.file && document.file.fileId) {
      try {
        await gridFSBucket.delete(document.file.fileId);
      } catch (fileError) {
        console.warn('Could not delete file from GridFS:', fileError.message);
      }
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user document:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document'
    });
  }
};

// ✅ GET EXTENDED PROFILE
exports.getExtendedProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    // Only count template-based documents
    const documentCount = await UserDocument.countDocuments({ 
      user: req.user.id,
      originalTemplate: { $exists: true, $ne: null }
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name || user.username,
        plan: user.plan,
        planId: user.planId,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        planExpiryDate: user.planExpiryDate,
        joinedDate: user.createdAt,
        documentCount
      }
    });
  } catch (error) {
    console.error('Get extended profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ✅ FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ 
        success: true,
        message: 'If the email exists, OTP has been sent to your email' 
      });
    }

    const otp = generateNumericOTP(6);
    console.log('📧 Generated OTP for', email, ':', otp);

    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({
      email,
      otpHash,
      expiresAt,
    });

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5; text-align: center;">Password Reset OTP</h2>
        <p>You requested a password reset for your StartupDocs Builder account.</p>
        <p>Your OTP code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; background: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p style="color: #6B7280; font-size: 14px;">For security reasons, do not share this OTP with anyone.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'StartupDocs Builder - Password Reset OTP',
      html: message,
    });

    console.log('✅ OTP sent successfully to:', email);

    res.json({
      success: true,
      message: 'OTP has been sent to your email',
      ...(process.env.NODE_ENV !== 'production' && { debugOtp: otp })
    });

  } catch (error) {
    console.error('Forgot password OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again.' 
    });
  }
};

// ✅ VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and OTP are required' 
      });
    }

    const otpRecord = await Otp.findOne({ 
      email, 
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired OTP' 
      });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    const isValid = await compareOtp(otp, otpRecord.otpHash);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      return res.status(400).json({ 
        success: false,
        message: 'Invalid OTP' 
      });
    }

    otpRecord.used = true;
    await otpRecord.save();

    const resetToken = jwt.sign(
      { 
        email, 
        purpose: 'password_reset',
        otpVerified: true
      },
      process.env.JWT_SECRET || 'your-fallback-secret',
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again.' 
    });
  }
};

// ✅ RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Reset token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-fallback-secret');
    } catch (jwtError) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token' 
      });
    }

    if (decoded.purpose !== 'password_reset' || !decoded.otpVerified) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid reset token' 
      });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successfully for:', decoded.email);

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again.' 
    });
  }
};

// ✅ DOWNLOAD TEMPLATE FILE
exports.downloadTemplateFile = async (req, res) => {
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

    // ✅ ALL ACCESS CHECKS DISABLED - ALL USERS CAN DOWNLOAD ALL TEMPLATES
    console.log('🔓 ACCESS: Allowing download for all users - access checks disabled');

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
    const originalFileName = gridFSFile.filename;
    const fileExtension = originalFileName.split('.').pop().toLowerCase();
    const filename = `${template.name.replace(/\s+/g, '_')}.${fileExtension}`;
    
    const contentType = getContentType(fileExtension);
    
    // Update download count
    template.downloadCount = (template.downloadCount || 0) + 1;
    await template.save();

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
};

// ✅ GET TEMPLATE PREVIEW
exports.getTemplatePreview = async (req, res) => {
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

    // ✅ ALL ACCESS CHECKS DISABLED - ALL USERS CAN PREVIEW ALL TEMPLATES
    console.log('🔓 ACCESS: Allowing preview for all users - access checks disabled');

    // Get actual file info from GridFS with enhanced detection
    let actualFileInfo = null;
    let detectedFileExtension = 'docx';

    if (template.file && template.file.fileId) {
      const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
      if (files.length > 0) {
        const gridFSFile = files[0];
        
        const fileName = gridFSFile.filename;
        const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
        const fileExtension = extensionMatch ? extensionMatch[1].toLowerCase() : 'docx';
        
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

    let finalFileExtension = detectedFileExtension;
    
    if (template.fileType && finalFileExtension === 'docx') {
      const templateFileType = template.fileType.replace('.', '').toLowerCase();
      const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
      if (validExtensions.includes(templateFileType)) {
        finalFileExtension = templateFileType;
      }
    }

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
        fileType: finalFileExtension,
        fileExtension: finalFileExtension,
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
};

// ✅ GET ALL TEMPLATES
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ isActive: true })
      .populate('category', 'name icon')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .sort({ createdAt: -1 });

    const enhancedTemplates = await Promise.all(
      templates.map(async (template) => {
        let fileExtension = 'docx';
        
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

        if (fileExtension === 'docx' && template.fileType) {
          const templateFileType = template.fileType.replace('.', '').toLowerCase();
          const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
          if (validExtensions.includes(templateFileType)) {
            fileExtension = templateFileType;
          }
        }

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
};

// ✅ GET USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        plan: req.user.plan,
        planId: req.user.planId,
        isPremium: req.user.isPremium,
        subscriptionStatus: req.user.subscriptionStatus,
        planExpiryDate: req.user.planExpiryDate
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ TEST OTP GENERATION
exports.testOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateNumericOTP(6);
    const hashedOtp = await hashOtp(otp);
    
    console.log('🔧 TEST - Generated OTP:', otp);
    console.log('🔧 TEST - Hashed OTP:', hashedOtp);

    res.json({
      success: true,
      message: 'OTP generated successfully',
      otp: otp,
      hashedOtp: hashedOtp,
      email: email
    });
  } catch (error) {
    console.error('Test OTP error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET USER PLAN DETAILS
exports.getUserPlanDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get active payment for user
    const activePayment = await Payment.findOne({
      userId: user._id,
      status: 'success'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        plan: user.plan || 'Free',
        planId: user.planId || 'free',
        subscriptionStatus: user.subscriptionStatus || 'inactive',
        isPremium: user.isPremium || false,
        planExpiryDate: user.planExpiryDate,
        billingCycle: user.billingCycle,
        lastPaymentDate: user.lastPaymentDate,
        nextPaymentDate: user.nextPaymentDate,
        accessLevel: user.accessLevel,
        paymentDetails: activePayment ? {
          planName: activePayment.planName,
          billingCycle: activePayment.billingCycle,
          amount: activePayment.amount,
          expiryDate: activePayment.expiryDate,
          autoRenewal: activePayment.autoRenewal
        } : null
      }
    });
  } catch (error) {
    console.error('Get user plan details error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ CHECK TEMPLATE ACCESS
exports.checkTemplateAccess = async (req, res) => {
  try {
    const { templateId } = req.params;
    const user = await User.findById(req.user.id);
    
    // For now, allow all users to access all templates
    // You can implement plan-based restrictions here later
    res.json({
      success: true,
      hasAccess: true,
      userPlan: user.plan || 'Free',
      planId: user.planId || 'free',
      isPremium: user.isPremium || false
    });
  } catch (error) {
    console.error('Check template access error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ UPDATE USER PLAN AFTER PAYMENT (CRITICAL FIX)
exports.updateUserPlanAfterPayment = async (userId, planId, billingCycle = 'monthly') => {
  try {
    console.log('🔥 CRITICAL UPDATE STARTING:', { userId, planId, billingCycle });
    
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    console.log('🔄 Found user:', user.email);
    console.log('📊 Current plan:', {
      plan: user.plan,
      planId: user.planId,
      isPremium: user.isPremium
    });

    let plan;
    
    // Try to find by planId string first
    plan = await PricingPlan.findOne({ planId: planId });
    
    // If not found, try by name
    if (!plan) {
      plan = await PricingPlan.findOne({ name: planId });
    }
    
    // Last resort: try by ObjectId
    if (!plan && mongoose.Types.ObjectId.isValid(planId)) {
      plan = await PricingPlan.findById(planId);
    }

    if (!plan) {
      console.warn(`⚠️ Plan not found in DB, using provided planId: ${planId}`);
      plan = {
        name: planId.charAt(0).toUpperCase() + planId.slice(1),
        planId: planId,
        _id: null
      };
    }

    console.log('📋 Plan details to apply:', {
      planName: plan.name,
      planId: plan.planId,
      isPremium: plan.name.toLowerCase() !== 'free'
    });

    // Calculate expiry date
    const calculateExpiryDate = (cycle) => {
      const now = new Date();
      if (cycle === "annual") {
        return new Date(now.setFullYear(now.getFullYear() + 1));
      } else {
        return new Date(now.setMonth(now.getMonth() + 1));
      }
    };

    // DIRECT UPDATE - Don't use instance method to avoid confusion
    user.plan = plan.name;
    user.planId = plan.planId;
    user.currentPlanId = plan.planId;
    user.billingCycle = billingCycle;
    user.subscriptionStatus = 'active';
    user.isPremium = plan.name.toLowerCase() !== 'free';
    user.planExpiryDate = calculateExpiryDate(billingCycle);
    user.lastPaymentDate = new Date();
    
    // Calculate next payment date
    const now = new Date();
    if (billingCycle === 'annual') {
      user.nextPaymentDate = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      user.nextPaymentDate = new Date(now.setMonth(now.getMonth() + 1));
    }

    console.log('🛠️ User object before save:', {
      plan: user.plan,
      planId: user.planId,
      isPremium: user.isPremium,
      subscriptionStatus: user.subscriptionStatus,
      planExpiryDate: user.planExpiryDate
    });

    // Save the user
    try {
      await user.save();
      console.log('✅ User saved successfully');
      
      // Verify the save by fetching fresh data
      const updatedUser = await User.findById(userId);
      console.log('✅ Verified updated user:', {
        plan: updatedUser.plan,
        planId: updatedUser.planId,
        isPremium: updatedUser.isPremium,
        subscriptionStatus: updatedUser.subscriptionStatus,
        planExpiryDate: updatedUser.planExpiryDate,
        billingCycle: updatedUser.billingCycle,
        lastPaymentDate: updatedUser.lastPaymentDate,
        nextPaymentDate: updatedUser.nextPaymentDate
      });
      
      return updatedUser;
    } catch (saveError) {
      console.error('❌ Error saving user:', saveError.message);
      if (saveError.errors) {
        console.error('Validation errors:', saveError.errors);
      }
      throw saveError;
    }
  } catch (error) {
    console.error('❌ updateUserPlanAfterPayment error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

// ✅ GET USER CURRENT PLAN INFO
exports.getUserCurrentPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get payment details
    const latestPayment = await Payment.findOne({
      userId: user._id,
      status: 'success'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      plan: user.plan,
      planId: user.planId,
      currentPlanId: user.currentPlanId,
      subscriptionStatus: user.subscriptionStatus,
      isPremium: user.isPremium,
      planExpiryDate: user.planExpiryDate,
      billingCycle: user.billingCycle,
      lastPaymentDate: user.lastPaymentDate,
      nextPaymentDate: user.nextPaymentDate,
      paymentDetails: latestPayment ? {
        transactionId: latestPayment.transactionId,
        planName: latestPayment.planName,
        planId: latestPayment.planId,
        amount: latestPayment.amount,
        currency: latestPayment.currency,
        paymentDate: latestPayment.paidAt
      } : null
    });
  } catch (error) {
    console.error('Get user current plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ VERIFY USER PLAN STATUS
exports.verifyPlanStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if plan has expired
    let isActive = true;
    let message = 'Plan is active';

    if (user.planExpiryDate && new Date() > user.planExpiryDate) {
      // Plan expired, downgrade to free
      user.plan = 'Free';
      user.planId = 'free';
      user.currentPlanId = 'free';
      user.subscriptionStatus = 'inactive';
      user.isPremium = false;
      user.planExpiryDate = null;
      user.billingCycle = 'monthly';
      
      await user.save();
      
      isActive = false;
      message = 'Plan expired, downgraded to Free';
    }

    res.json({
      success: true,
      isActive,
      message,
      user: {
        plan: user.plan,
        planId: user.planId,
        subscriptionStatus: user.subscriptionStatus,
        isPremium: user.isPremium,
        planExpiryDate: user.planExpiryDate
      }
    });
  } catch (error) {
    console.error('Verify plan status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};