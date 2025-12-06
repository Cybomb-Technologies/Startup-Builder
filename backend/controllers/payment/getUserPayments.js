// controllers/payment/getUserPayments.js
const Payment = require("../../models/Payment");

// Get user payments
const getUserPayments = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;
    
    const payments = await Payment.find({ 
      userId: userId
    }).sort({ createdAt: -1 }).limit(20);

    return res.json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user payments",
    });
  }
};

module.exports = getUserPayments;