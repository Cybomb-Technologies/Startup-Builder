// controllers/adminPayment/updatePaymentStatus.js
const Payment = require("../../models/Payment");

// @desc    Update payment status (admin only)
// @route   PUT /api/admin/payments/:id/status
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!status || !['success', 'failed', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required: success, failed, or pending'
      });
    }

    const payment = await Payment.findById(req.params.id)
      .populate('userId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Store old status
    const oldStatus = payment.status;
    
    // Update payment
    payment.status = status;
    
    if (status === 'success' && !payment.paidAt) {
      payment.paidAt = new Date();
    }
    
    if (notes) {
      payment.adminNotes = notes;
    }

    await payment.save();

    // If status changed to success, update user's plan
    if (status === 'success' && oldStatus !== 'success' && payment.userId) {
      try {
        // Use the updateUserPlan function from paymentController
        const { updateUserPlan } = require('../paymentController');
        await updateUserPlan(payment.userId._id, payment.planId, payment.billingCycle);
        
        console.log(`✅ User plan updated for payment: ${payment.transactionId}`);
      } catch (planError) {
        console.error('❌ Error updating user plan:', planError);
        // Continue with response even if plan update fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        status: payment.status,
        planName: payment.planName,
        amount: payment.amount
      }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = updatePaymentStatus;