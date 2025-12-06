// getUserPlanDetails.js
const User = require('../../models/User');
const Payment = require('../../models/Payment');

exports.getUserPlanDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get active payment for user
    const activePayment = await Payment.findOne({
      userId: user._id,
      status: 'success'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        plan: user.plan || 'Free',
        planId: user.planId || 'free',
        subscriptionStatus: user.subscriptionStatus || 'inactive',
        isPremium: user.isPremium || false,
        planExpiryDate: user.planExpiryDate,
        billingCycle: user.billingCycle,
        lastPaymentDate: user.lastPaymentDate,
        nextPaymentDate: user.nextPaymentDate,
        accessLevel: user.accessLevel,
        paymentDetails: activePayment ? {
          planName: activePayment.planName,
          billingCycle: activePayment.billingCycle,
          amount: activePayment.amount,
          expiryDate: activePayment.expiryDate,
          autoRenewal: activePayment.autoRenewal
        } : null
      }
    });
  } catch (error) {
    console.error('Get user plan details error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};