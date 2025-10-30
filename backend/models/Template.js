const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Install: npm install uuid

const templateSchema = new mongoose.Schema({
  documentId: {
    type: String,
    unique: true,
    default: () => uuidv4()
  },
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Template name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  },
  accessLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccess',
    required: [true, 'Access level is required']
  },
  content: {
    type: String,
    required: [true, 'Template content is required']
  },
  // File storage in MongoDB using GridFS
  file: {
    fileId: {
      type: mongoose.Schema.Types.ObjectId // GridFS file ID
    },
    fileName: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number // Size in bytes
    },
    fileType: {
      type: String,
      trim: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Update the updatedAt field before saving
templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted file size
templateSchema.virtual('formattedFileSize').get(function() {
  if (!this.file || !this.file.fileSize) return null;
  
  const bytes = this.file.fileSize;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for file extension
templateSchema.virtual('fileExtension').get(function() {
  if (!this.file || !this.file.fileName) return null;
  return this.file.fileName.split('.').pop().toLowerCase();
});

// Index for better performance
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ accessLevel: 1 });
templateSchema.index({ createdAt: -1 });
templateSchema.index({ documentId: 1 }); // Index for documentId

// Ensure virtual fields are serialized
templateSchema.set('toJSON', { virtuals: true });
templateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Template', templateSchema);