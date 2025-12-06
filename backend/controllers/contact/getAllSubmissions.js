// controllers/contact/getAllSubmissions.js
const Contact = require('../../models/Contact');

// ✅ Get all contact form submissions (for admin)
const getAllSubmissions = async (req, res) => {
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
};

module.exports = getAllSubmissions;