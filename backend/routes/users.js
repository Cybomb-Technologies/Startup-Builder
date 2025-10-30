// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/emailService');
const { generateNumericOTP, hashOtp, compareOtp } = require('../utils/otp');

// ✅ Login Route
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

    const isPasswordValid = await user.comparePassword(password);
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
        email: user.email,
        name: user.name || user.email,
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

// ✅ OTP Forgot Password Route
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

// ✅ OTP Verification Route
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

// ✅ Reset Password with Token
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

// ✅ Test OTP Generation Route (Remove in production)
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

module.exports = router;