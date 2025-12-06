// getUserDocument.js
const UserDocument = require('../../models/UserDocument');

exports.getUserDocument = async (req, res) => {
  try {
    const document = await UserDocument.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('originalTemplate', 'name category fileType');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error fetching user document:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document'
    });
  }
};