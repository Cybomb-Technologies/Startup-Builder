// validatetoken.js
exports.validateToken = async (req, res) => {
  try {
    console.log('✅ TOKEN VALIDATION: Token is valid for user:', req.user.email);
    
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        plan: req.user.plan || 'Free',
        planId: req.user.planId || 'free',
        isPremium: req.user.isPremium || false,
        subscriptionStatus: req.user.subscriptionStatus || 'inactive',
        planExpiryDate: req.user.planExpiryDate
      }
    });
  } catch (error) {
    console.error('❌ TOKEN VALIDATION ERROR:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};