const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// ✅ Get all contact form submissions (for admin)
router.get('/submissions', async (req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions'
    });
  }
});

// ✅ Submit contact form
router.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create new contact submission
    const contactSubmission = new Contact({
      name,
      email,
      subject,
      message
    });

    await contactSubmission.save();

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully! We will get back to you soon.',
      data: contactSubmission
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form'
    });
  }
});

// ✅ Delete contact submission
router.delete('/:id', async (req, res) => {
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
});

// ✅ Mark as read/unread
router.patch('/:id/read', async (req, res) => {
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
});

module.exports = router;