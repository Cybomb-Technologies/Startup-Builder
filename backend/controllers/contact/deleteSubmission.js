// controllers/contact/deleteSubmission.js
const Contact = require('../../models/Contact');

// ✅ Delete contact submission
const deleteSubmission = async (req, res) => {
  try {
    const submission = await Contact.findByIdAndDelete(req.params.id);
   
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission'
    });
  }
};

module.exports = deleteSubmission;