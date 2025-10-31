// models/Otp.js
const mongoose = require('mongoose');
 
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true }, // hashed otp
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
});
 
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // optional TTL removal
 
module.exports = mongoose.model('Otp', otpSchema);
 