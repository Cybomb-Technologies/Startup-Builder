// controllers/billing/toggleAutoRenewal.js
const Payment = require('../../models/Payment');

// Toggle auto-renewal
const toggleAutoRenewal = async (req, res) => {
  try {
    const { autoRenewal } = req.body;
    
    // Update all successful payments for this user
    await Payment.updateMany(
      {
        userId: req.user.id,
        status: 'success'
      },
      {
        autoRenewal: autoRenewal,
        renewalStatus: autoRenewal ? 'scheduled' : 'cancelled'
      }
    );

    res.json({
      success: true,
      message: `Auto-renewal ${autoRenewal ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error("Error toggling auto-renewal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update auto-renewal settings"
    });
  }
};

module.exports = toggleAutoRenewal;