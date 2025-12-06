// controllers/newsletter/subscribe.js
const Newsletter = require('../../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'Email already subscribed'
      });
    }

    const subscriber = await Newsletter.create({ email });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscriber: { email: subscriber.email }
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already subscribed'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error subscribing to newsletter'
    });
  }
};

module.exports = subscribe;