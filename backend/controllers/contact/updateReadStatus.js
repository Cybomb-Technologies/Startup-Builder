// controllers/contact/updateReadStatus.js
const Contact = require('../../models/Contact');

// ✅ Mark as read/unread
const updateReadStatus = async (req, res) => {
  try {
    const { read } = req.body;
    const submission = await Contact.findByIdAndUpdate(
      req.params.id,
      { read },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: `Submission marked as ${read ? 'read' : 'unread'}`,
      data: submission
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission'
    });
  }
};

module.exports = updateReadStatus;