// controllers/payment/handlePaymentWebhook.js
const Payment = require("../../models/Payment");
const updateUserPlan = require('./updateUserPlan');
const { sendInvoiceAfterPayment } = require("../invoiceController");

// Webhook handler
const handlePaymentWebhook = async (req, res) => {
  try {
    const { data, event } = req.body;

    if (event === "PAYMENT_SUCCESS_WEBHOOK") {
      const { orderId } = data;

      console.log("✅ Payment webhook received:", { orderId });

      // Update payment record
      const paymentRecord = await Payment.findOne({ transactionId: orderId });
      if (paymentRecord) {
        paymentRecord.status = "success";
        paymentRecord.paymentMethod = data.payment?.payment_method || "card";
        paymentRecord.paidAt = new Date();
        await paymentRecord.save();

        // CRITICAL: Update user plan via webhook
        console.log("🔄 Webhook: Updating user plan with:", {
          userId: paymentRecord.userId,
          planId: paymentRecord.planId,
          billingCycle: paymentRecord.billingCycle
        });
        
        try {
          // Use the same updateUserPlan function
          const updatedUser = await updateUserPlan(
            paymentRecord.userId, 
            paymentRecord.planId, 
            paymentRecord.billingCycle
          );
          
          console.log("✅ Webhook: User plan updated successfully:", {
            userId: updatedUser._id,
            currentPlanId: updatedUser.currentPlanId,
            subscriptionStatus: updatedUser.subscriptionStatus
          });
        } catch (updateError) {
          console.error("❌ Webhook: Failed to update user plan:", updateError);
        }

        // SEND INVOICE EMAIL VIA WEBHOOK
        console.log("📧 Webhook: Sending invoice email for transaction:", paymentRecord.transactionId);
        try {
          await sendInvoiceAfterPayment(paymentRecord.transactionId, paymentRecord.userId);
          console.log("✅ Webhook: Invoice email sent successfully");
        } catch (invoiceError) {
          console.error("❌ Webhook: Failed to send invoice email:", invoiceError);
        }

        console.log("✅ User plan updated via webhook for order:", orderId);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ success: false });
  }
};

module.exports = handlePaymentWebhook;