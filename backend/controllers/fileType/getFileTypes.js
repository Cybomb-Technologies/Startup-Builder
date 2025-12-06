// controllers/fileType/getFileTypes.js
const FileType = require('../../models/FileType');
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

module.exports = getFileTypes;