// backend/models/Pricing.js
const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  included: {
    type: Boolean,
    default: true
  },
  description: String
});

const pricingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Free', 'Pro', 'Business', 'Enterprise']
  },
  planId: {
    type: String,
    required: true,
    unique: true,
    enum: ['free', 'pro', 'business', 'enterprise']
  },
  description: {
    type: String,
    required: true
  },
  monthlyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  yearlyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  features: [featureSchema],
  popular: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  downloadLimit: {
    type: String,
    default: '5'
  },
  storage: {
    type: String,
    default: '1 GB'
  },
  supportType: {
    type: String,
    default: 'Community'
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'from-blue-500 to-cyan-600'
  },
  ctaText: {
    type: String,
    required: true
  },
  annualDiscount: {
    type: Number,
    default: 15
  },
  position: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pricing', pricingPlanSchema);