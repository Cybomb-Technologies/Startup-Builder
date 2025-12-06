// controllers/adminPayment/deletePayment.js
const Payment = require("../../models/Payment");

// @desc    Delete a payment (admin only)
// @route   DELETE /api/admin/payments/:id
// @access  Private/Admin
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Prevent deletion of successful payments unless confirmed
    if (payment.status === 'success' && !req.query.force) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete successful payment without confirmation. Use ?force=true to force delete.'
      });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = deletePayment;