// getUserCurrentPlan.js
const User = require('../../models/User');
const Payment = require('../../models/Payment');

exports.getUserCurrentPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get payment details
    const latestPayment = await Payment.findOne({
      userId: user._id,
      status: 'success'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      plan: user.plan,
      planId: user.planId,
      currentPlanId: user.currentPlanId,
      subscriptionStatus: user.subscriptionStatus,
      isPremium: user.isPremium,
      planExpiryDate: user.planExpiryDate,
      billingCycle: user.billingCycle,
      lastPaymentDate: user.lastPaymentDate,
      nextPaymentDate: user.nextPaymentDate,
      paymentDetails: latestPayment ? {
        transactionId: latestPayment.transactionId,
        planName: latestPayment.planName,
        planId: latestPayment.planId,
        amount: latestPayment.amount,
        currency: latestPayment.currency,
        paymentDate: latestPayment.paidAt
      } : null
    });
  } catch (error) {
    console.error('Get user current plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};