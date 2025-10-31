// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateNumericOTP, hashOtp, compareOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/mailer');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
 
// rate limiters: limit forgot and verify endpoints
const forgotLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: 6, // per IP per window
  message: 'Too many OTP requests, try again later'
});
 
router.post('/forgot', forgotLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
 
    const user = await User.findOne({ email });
    if (!user) {
      // To avoid user enumeration, return 200 anyway
      return res.json({ message: 'If this email exists, an OTP has been sent' });
    }
 
    // generate OTP
    const otp = generateNumericOTP(6);
    const otpHash = await hashOtp(otp);
    const ttlMinutes = 10;
    const expiresAt = new Date(Date.now() + ttlMinutes*60*1000);
 
    // store OTP (you could delete previous OTPs for this email first)
    await Otp.create({ email, otpHash, expiresAt, used: false, attempts: 0 });
 
    // send email
    await sendOtpEmail(email, otp);
 
    return res.json({ message: 'If this email exists, an OTP has been sent' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});
 
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
 
    const otpDoc = await Otp.findOne({ email, used: false }).sort({ createdAt: -1 });
    if (!otpDoc) return res.status(400).json({ message: 'Invalid or expired OTP' });
 
    if (otpDoc.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });
 
    if (otpDoc.attempts >= 5) return res.status(429).json({ message: 'Too many attempts' });
 
    const isMatch = await compareOtp(otp, otpDoc.otpHash);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }
 
    // OTP success: mark used
    otpDoc.used = true;
    await otpDoc.save();
 
    // Create a short-lived token to allow resetting password (or return a flag)
    // Token could be a JWT signed with secret and expires in e.g., 15 minutes
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
 
    return res.json({ message: 'OTP verified', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});
 
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token & new password required' });
 
    const jwt = require('jsonwebtoken');
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
 
    const user = await User.findOne({ email: payload.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
 
    user.password = newPassword; // pre 'save' hooks will hash
    await user.save();
 
    // Optionally delete all OTPs for that email
    await Otp.deleteMany({ email: payload.email });
 
    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});
 
module.exports = router;
 