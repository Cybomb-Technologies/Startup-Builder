// controllers/billing/getAutoRenewalStatus.js
const Payment = require('../../models/Payment');

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

module.exports = getAutoRenewalStatus;