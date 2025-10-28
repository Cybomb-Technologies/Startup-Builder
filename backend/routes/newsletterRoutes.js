const express = require('express');
const router = express.Router();

// In-memory storage (replace with database in production)
let subscribers = [];

// ✅ Get all subscribers
router.get('/subscribers', (req, res) => {
  try {
    console.log('📧 Fetching subscribers, total:', subscribers.length);
    res.json({
      success: true,
      subscribers: subscribers,
      count: subscribers.length
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscribers'
    });
  }
});

// ✅ Add new subscriber
router.post('/subscribe', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if email already exists
    if (subscribers.includes(email)) {
      return res.status(409).json({
        success: false,
        message: 'Email already subscribed'
      });
    }

    // Add to subscribers
    subscribers.push(email);
    
    console.log('✅ New subscriber added:', email);
    console.log('📊 Total subscribers:', subscribers.length);
    
    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      email: email
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({
      success: false,
      message: 'Error subscribing to newsletter'
    });
  }
});

// ✅ Delete subscriber
router.delete('/subscribers', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Remove subscriber
    const initialLength = subscribers.length;
    subscribers = subscribers.filter(sub => sub !== email);
    
    if (subscribers.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    console.log('🗑️ Subscriber deleted:', email);
    console.log('📊 Remaining subscribers:', subscribers.length);
    
    res.json({
      success: true,
      message: 'Subscriber deleted successfully',
      deletedEmail: email
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subscriber'
    });
  }
});

// ✅ Clear all subscribers
router.delete('/clear', (req, res) => {
  try {
    const count = subscribers.length;
    subscribers = [];
    
    console.log('🧹 All subscribers cleared. Previous count:', count);
    
    res.json({
      success: true,
      message: `All ${count} subscribers cleared successfully`,
      clearedCount: count
    });
  } catch (error) {
    console.error('Error clearing subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing subscribers'
    });
  }
});

// ✅ Alternative delete with query parameter
router.delete('/subscribers/:email', (req, res) => {
  try {
    const { email } = req.params;
    
    const initialLength = subscribers.length;
    subscribers = subscribers.filter(sub => sub !== email);
    
    if (subscribers.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscriber deleted successfully',
      deletedEmail: email
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subscriber'
    });
  }
});

// ✅ Get subscriber count
router.get('/count', (req, res) => {
  res.json({
    success: true,
    count: subscribers.length
  });
});

module.exports = router;