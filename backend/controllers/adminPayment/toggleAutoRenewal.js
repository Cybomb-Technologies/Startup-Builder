// controllers/adminPayment/toggleAutoRenewal.js
const Payment = require("../../models/Payment");

// @desc    Toggle auto-renewal for a payment
// @route   PUT /api/admin/payments/:id/auto-renewal
// @access  Private/Admin
const toggleAutoRenewal = async (req, res) => {
  try {
    const { autoRenewal } = req.body;

    if (typeof autoRenewal !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'autoRenewal must be a boolean value'
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.autoRenewal = autoRenewal;
    payment.renewalStatus = autoRenewal ? 'scheduled' : 'cancelled';
    
    await payment.save();

    res.status(200).json({
      success: true,
      message: `Auto-renewal ${autoRenewal ? 'enabled' : 'disabled'} successfully`,
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        autoRenewal: payment.autoRenewal,
        renewalStatus: payment.renewalStatus
      }
    });
  } catch (error) {
    console.error('Toggle auto-renewal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating auto-renewal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = toggleAutoRenewal;