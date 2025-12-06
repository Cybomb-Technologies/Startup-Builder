// controllers/payment/downloadInvoice.js

// Get invoice download endpoint
const downloadInvoice = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    // Import invoice controller
    const { generateInvoice } = require("../invoiceController");
    
    // Use the existing invoice controller function
    return await generateInvoice(req, res);
  } catch (error) {
    console.error("Error in downloadInvoice:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download invoice",
    });
  }
};

module.exports = downloadInvoice;