// getExtendedProfile.js
const User = require('../../models/User');
const UserDocument = require('../../models/UserDocument');

exports.getExtendedProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    // Only count template-based documents
    const documentCount = await UserDocument.countDocuments({ 
      user: req.user.id,
      originalTemplate: { $exists: true, $ne: null }
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name || user.username,
        plan: user.plan,
        planId: user.planId,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        planExpiryDate: user.planExpiryDate,
        joinedDate: user.createdAt,
        documentCount
      }
    });
  } catch (error) {
    console.error('Get extended profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};