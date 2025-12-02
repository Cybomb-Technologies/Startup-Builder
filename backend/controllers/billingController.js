const Payment = require('../models/Payment');

// Get billing history
const getBillingHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ 
      userId: req.user.id 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error("Error fetching billing history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch billing history"
    });
  }
};

// Get auto-renewal status
const getAutoRenewalStatus = async (req, res) => {
  try {
    // Get the latest successful payment
    const latestPayment = await Payment.findOne({
      userId: req.user.id,
      status: 'success'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      autoRenewal: latestPayment ? latestPayment.autoRenewal : false
    });
  } catch (error) {
    console.error("Error fetching auto-renewal status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch auto-renewal status"
    });
  }
};

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

module.exports = {
  getBillingHistory,
  getAutoRenewalStatus,
  toggleAutoRenewal
};