// verifyPlanStatus.js
const User = require('../../models/User');

exports.verifyPlanStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if plan has expired
    let isActive = true;
    let message = 'Plan is active';

    if (user.planExpiryDate && new Date() > user.planExpiryDate) {
      // Plan expired, downgrade to free
      user.plan = 'Free';
      user.planId = 'free';
      user.currentPlanId = 'free';
      user.subscriptionStatus = 'inactive';
      user.isPremium = false;
      user.planExpiryDate = null;
      user.billingCycle = 'monthly';
      
      await user.save();
      
      isActive = false;
      message = 'Plan expired, downgraded to Free';
    }

    res.json({
      success: true,
      isActive,
      message,
      user: {
        plan: user.plan,
        planId: user.planId,
        subscriptionStatus: user.subscriptionStatus,
        isPremium: user.isPremium,
        planExpiryDate: user.planExpiryDate
      }
    });
  } catch (error) {
    console.error('Verify plan status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};