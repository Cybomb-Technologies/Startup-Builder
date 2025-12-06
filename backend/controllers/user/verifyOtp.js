// verifyOtp.js
const Otp = require('../../models/Otp');
const { compareOtp } = require('../../utils/otp');
const jwt = require('jsonwebtoken');

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