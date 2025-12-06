// controllers/newsletter/getSubscribers.js
const Newsletter = require('../../models/Newsletter');

// @desc    Get all subscribers (admin only)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscribers'
    });
  }
};

module.exports = getSubscribers;