// controllers/fileType/updateFileType.js
const FileType = require('../../models/FileType');
const asyncHandler = require('express-async-handler');

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

module.exports = updateFileType;