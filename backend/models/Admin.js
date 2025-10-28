const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false // Hide by default for security
  },
  companyCode: {
    type: String,
    required: [true, 'Company code is required']
  },
  permissions: {
    type: [String],
    default: ['manage_users', 'manage_templates', 'manage_newsletter']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);