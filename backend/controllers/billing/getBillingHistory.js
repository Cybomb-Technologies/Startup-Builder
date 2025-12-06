// controllers/billing/getBillingHistory.js
const Payment = require('../../models/Payment');

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

module.exports = getBillingHistory;