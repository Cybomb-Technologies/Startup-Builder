// getProfile.js
exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        plan: req.user.plan,
        planId: req.user.planId,
        isPremium: req.user.isPremium,
        subscriptionStatus: req.user.subscriptionStatus,
        planExpiryDate: req.user.planExpiryDate
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};