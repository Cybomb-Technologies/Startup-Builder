// controllers/contact/submitContactForm.js
const Contact = require('../../models/Contact');

// ✅ Submit contact form
const submitContactForm = async (req, res) => {
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
};

module.exports = submitContactForm;