// controllers/payment/getUserPlanDetails.js
const User = require("../../models/User");
const Payment = require("../../models/Payment");

// Get user plan details
const getUserPlanDetails = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get active payment
    const activePayment = await Payment.findOne({
      userId: userId,
      status: 'success'
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      user: {
        plan: user.plan,
        planId: user.planId,
        currentPlanId: user.currentPlanId,
        subscriptionStatus: user.subscriptionStatus,
        isPremium: user.isPremium,
        planExpiryDate: user.planExpiryDate,
        billingCycle: user.billingCycle,
        lastPaymentDate: user.lastPaymentDate,
        nextPaymentDate: user.nextPaymentDate,
        accessLevel: user.accessLevel
      },
      paymentDetails: activePayment ? {
        planName: activePayment.planName,
        planId: activePayment.planId,
        billingCycle: activePayment.billingCycle,
        amount: activePayment.amount,
        currency: activePayment.currency,
        expiryDate: activePayment.expiryDate,
        autoRenewal: activePayment.autoRenewal,
        paymentDate: activePayment.paidAt
      } : null
    });
  } catch (error) {
    console.error("Error fetching user plan details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user plan details",
    });
  }
};

module.exports = getUserPlanDetails;