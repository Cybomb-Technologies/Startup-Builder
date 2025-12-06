// controllers/fileType/deleteFileType.js
const FileType = require('../../models/FileType');
const asyncHandler = require('express-async-handler');

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
  const Template = require('../../models/Template');
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

module.exports = deleteFileType;