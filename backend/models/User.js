// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String }, // Add name field if needed
  // Remove passwordResetToken fields for OTP approach
}, {
  timestamps: true
});

userSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = function(plain){
  return bcrypt.compare(plain, this.password);
}

module.exports = mongoose.model('User', userSchema);