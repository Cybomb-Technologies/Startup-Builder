// updateUserDocument.js
const UserDocument = require('../../models/UserDocument');

exports.updateUserDocument = async (req, res) => {
  try {
    const { name } = req.body;
    
    const document = await UserDocument.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        name,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('originalTemplate', 'name category fileType');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Error updating user document:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document'
    });
  }
};