// controllers/adminPayment/getPaymentById.js
const Payment = require("../../models/Payment");

// @desc    Get single payment details
// @route   GET /api/admin/payments/:id
// @access  Private/Admin
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'username email plan planId subscriptionStatus');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get user's payment history
    const userPaymentHistory = await Payment.find({ 
      userId: payment.userId 
    }).sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        user: payment.userId ? {
          id: payment.userId._id,
          username: payment.userId.username,
          email: payment.userId.email,
          currentPlan: payment.userId.plan,
          currentPlanId: payment.userId.planId,
          subscriptionStatus: payment.userId.subscriptionStatus
        } : null,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        planId: payment.planId,
        planName: payment.planName,
        billingCycle: payment.billingCycle,
        paymentMethod: payment.paymentMethod,
        autoRenewal: payment.autoRenewal,
        renewalStatus: payment.renewalStatus,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        paidAt: payment.paidAt,
        expiryDate: payment.expiryDate
      },
      userPaymentHistory: userPaymentHistory.map(p => ({
        id: p._id,
        transactionId: p.transactionId,
        amount: p.amount,
        status: p.status,
        planName: p.planName,
        billingCycle: p.billingCycle,
        createdAt: p.createdAt,
        paidAt: p.paidAt
      }))
    });
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = getPaymentById;