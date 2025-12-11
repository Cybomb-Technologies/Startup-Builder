// forgotPassword.js
const User = require('../../models/User');
const Otp = require('../../models/Otp');
const sendEmail = require('../../utils/emailService');
const { generateNumericOTP, hashOtp } = require('../../utils/otp');
const jwt = require('jsonwebtoken');

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
        <p>You requested a password reset for your Paplixo account.</p>
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
      subject: 'Paplixo - Password Reset OTP',
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