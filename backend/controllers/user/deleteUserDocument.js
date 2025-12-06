// deleteUserDocument.js
const { gridFSBucket } = require('./helpers');
const UserDocument = require('../../models/UserDocument');

exports.deleteUserDocument = async (req, res) => {
  try {
    const document = await UserDocument.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Optional: Delete the associated file from GridFS
    if (document.file && document.file.fileId) {
      try {
        await gridFSBucket.delete(document.file.fileId);
      } catch (fileError) {
        console.warn('Could not delete file from GridFS:', fileError.message);
      }
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user document:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document'
    });
  }
};