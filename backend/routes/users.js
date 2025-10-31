// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Template = require('../models/Template');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/emailService');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
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

// ✅ REGISTER USER (Enhanced from code 2)
router.post('/register', async (req, res) => {
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
        plan: newUser.plan 
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// ✅ LOGIN USER (Combined best of both versions)
router.post('/login', async (req, res) => {
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

    // Use the method from code 1 (bcrypt.compare) or code 2 (user.comparePassword)
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
});

// ✅ OTP Forgot Password Route (From code 1)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists
      return res.json({ 
        success: true,
        message: 'If the email exists, OTP has been sent to your email' 
      });
    }

    // Generate OTP
    const otp = generateNumericOTP(6);
    console.log('📧 Generated OTP for', email, ':', otp);

    // Hash OTP
    const otpHash = await hashOtp(otp);

    // Set expiry (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to database
    await Otp.create({
      email,
      otpHash,
      expiresAt,
    });

    // Send OTP via email
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
      // Include OTP in development for testing
      ...(process.env.NODE_ENV !== 'production' && { debugOtp: otp })
    });

  } catch (error) {
    console.error('Forgot password OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again.' 
    });
  }
});

// ✅ OTP Verification Route (From code 1)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and OTP are required' 
      });
    }

    // Find the latest OTP for this email
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

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    const isValid = await compareOtp(otp, otpRecord.otpHash);

    if (!isValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      return res.status(400).json({ 
        success: false,
        message: 'Invalid OTP' 
      });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Generate temporary token for password reset (valid for 15 minutes)
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
});

// ✅ Reset Password with Token (From code 1)
router.post('/reset-password', async (req, res) => {
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

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-fallback-secret');
    } catch (jwtError) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token' 
      });
    }

    // Check if token is for password reset
    if (decoded.purpose !== 'password_reset' || !decoded.otpVerified) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid reset token' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update password
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
});

// ✅ Template Routes (From code 2)
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

// GET TEMPLATE PREVIEW DATA (From code 2)
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

// GET ALL TEMPLATES (From code 2)
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

// GET USER PROFILE (From code 2)
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

// ✅ Test OTP Generation Route (Remove in production) - From code 1
router.post('/test-otp', async (req, res) => {
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
});

// Helper function to get content type based on file extension (From code 2)
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