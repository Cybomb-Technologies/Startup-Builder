const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  permissions: {
    type: [String],
    default: ['manage_users', 'manage_templates', 'manage_newsletter']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);