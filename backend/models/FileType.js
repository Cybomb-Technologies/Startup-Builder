const mongoose = require('mongoose');

const fileTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'File type name is required'],
    trim: true,
    unique: true,
    uppercase: true,
    maxlength: [10, 'File type cannot exceed 10 characters']
  },
  description: {
    type: String,
    maxlength: [100, 'Description cannot exceed 100 characters']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  extension: {
    type: String,
    required: [true, 'File extension is required']
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

fileTypeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FileType', fileTypeSchema);