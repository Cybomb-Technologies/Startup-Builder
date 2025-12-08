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
    type: String,
    default: 'free'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  lastPaymentDate: {
    type: Date
  },
  nextPaymentDate: {
    type: Date
  },
  // ADD THIS FAVORITES FIELD
  favorites: [{
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
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

// Method to update user plan
userSchema.methods.updatePlan = async function(planDetails) {
  const {
    planName,
    planId,
    billingCycle = 'monthly',
    expiryDate,
    isPremium = false
  } = planDetails;

  this.plan = planName || this.plan;
  this.planId = planId || this.planId;
  this.currentPlanId = planId || this.currentPlanId;
  this.billingCycle = billingCycle;
  this.subscriptionStatus = 'active';
  this.isPremium = isPremium || false;
  this.planExpiryDate = expiryDate || this.planExpiryDate;
  this.lastPaymentDate = new Date();

  // Calculate next payment date
  const now = new Date();
  if (billingCycle === 'annual') {
    this.nextPaymentDate = new Date(now.setFullYear(now.getFullYear() + 1));
  } else {
    this.nextPaymentDate = new Date(now.setMonth(now.getMonth() + 1));
  }

  console.log('🔄 User plan update details:', {
    plan: this.plan,
    planId: this.planId,
    billingCycle: this.billingCycle,
    isPremium: this.isPremium,
    subscriptionStatus: this.subscriptionStatus,
    planExpiryDate: this.planExpiryDate
  });

  try {
    await this.save();
    console.log('✅ User plan saved successfully');
    return this;
  } catch (saveError) {
    console.error('❌ Error saving user plan:', saveError);
    throw saveError;
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;