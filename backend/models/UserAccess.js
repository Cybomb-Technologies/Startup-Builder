const mongoose = require('mongoose');

const userAccessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Access level name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Access level name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  permissions: {
    canCreateTemplates: { type: Boolean, default: false },
    canEditTemplates: { type: Boolean, default: false },
    canDeleteTemplates: { type: Boolean, default: false },
    canAccessPremium: { type: Boolean, default: false },
    maxTemplates: { type: Number, default: 5 },
    maxFileSize: { type: Number, default: 10 } // in MB
  },
  price: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userAccessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserAccess', userAccessSchema);