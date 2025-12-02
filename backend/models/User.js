const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  plan: { 
    type: String,
    enum: ['Free', 'Pro', 'Business', 'Enterprise'],
    default: 'Free'
  },
  planId: { 
    type: String,
    default: 'free'
  },
  accessLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccess'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'trial', 'cancelled'],
    default: 'inactive'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  planExpiryDate: {
    type: Date
  },
  currentPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PricingPlan'
  }
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;