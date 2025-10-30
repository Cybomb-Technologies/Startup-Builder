const FileType = require('../models/FileType');
const asyncHandler = require('express-async-handler');

// @desc    Get all file types
// @route   GET /api/admin/file-types
// @access  Private/Admin
const getFileTypes = asyncHandler(async (req, res) => {
  const fileTypes = await FileType.find({}).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: fileTypes.length,
    fileTypes
  });
});

// @desc    Create a file type
// @route   POST /api/admin/file-types
// @access  Private/Admin
const createFileType = asyncHandler(async (req, res) => {
  const { name, description, mimeType, extension } = req.body;

  const fileTypeExists = await FileType.findOne({ name });
  if (fileTypeExists) {
    return res.status(400).json({
      success: false,
      message: 'File type already exists'
    });
  }

  const fileType = await FileType.create({
    name: name.toUpperCase(),
    description,
    mimeType,
    extension
  });

  res.status(201).json({
    success: true,
    message: 'File type created successfully',
    fileType
  });
});

// @desc    Update a file type
// @route   PUT /api/admin/file-types/:id
// @access  Private/Admin
const updateFileType = asyncHandler(async (req, res) => {
  const { name, description, mimeType, extension, isActive } = req.body;

  let fileType = await FileType.findById(req.params.id);
  if (!fileType) {
    return res.status(404).json({
      success: false,
      message: 'File type not found'
    });
  }

  // Check if name is being changed and if it already exists
  if (name && name !== fileType.name) {
    const fileTypeExists = await FileType.findOne({ name: name.toUpperCase() });
    if (fileTypeExists) {
      return res.status(400).json({
        success: false,
        message: 'File type name already exists'
      });
    }
  }

  fileType = await FileType.findByIdAndUpdate(
    req.params.id,
    { 
      name: name ? name.toUpperCase() : fileType.name, 
      description, 
      mimeType, 
      extension, 
      isActive 
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'File type updated successfully',
    fileType
  });
});

// @desc    Delete a file type
// @route   DELETE /api/admin/file-types/:id
// @access  Private/Admin
const deleteFileType = asyncHandler(async (req, res) => {
  const fileType = await FileType.findById(req.params.id);
  
  if (!fileType) {
    return res.status(404).json({
      success: false,
      message: 'File type not found'
    });
  }

  // Check if any templates are using this file type
  const Template = require('../models/Template');
  const templatesCount = await Template.countDocuments({ fileType: req.params.id });
  
  if (templatesCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete file type that is used by templates'
    });
  }

  await FileType.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'File type deleted successfully'
  });
});

module.exports = {
  getFileTypes,
  createFileType,
  updateFileType,
  deleteFileType
};