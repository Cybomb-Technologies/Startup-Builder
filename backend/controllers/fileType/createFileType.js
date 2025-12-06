// controllers/fileType/createFileType.js
const FileType = require('../../models/FileType');
const asyncHandler = require('express-async-handler');

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

module.exports = createFileType;