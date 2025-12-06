// controllers/payment/verifyPayment.js
const axios = require("axios");
const mongoose = require("mongoose");
const Payment = require("../../models/Payment");
const User = require("../../models/User");
const PricingPlan = require("../../models/PricingPlan");
const updateUserPlan = require('./updateUserPlan');
const { sendInvoiceAfterPayment } = require("../invoiceController");

const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com/pg/orders";

// Verify Payment
const verifyPayment = async (req, res) => {
  try {
    console.log("=== verifyPayment called ===");
    console.log("Request body:", req.body);

    const { orderId, planId, billingCycle } = req.body;

    if (!req.user || !req.user.id) {
      console.error("User not authenticated");
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Please login again.",
      });
    }

    const userId = req.user.id;
    console.log("User ID:", userId);

    if (!orderId) {
      console.error("No orderId provided");
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    console.log("Verifying payment for order:", orderId);

    // First, check if we already have a successful payment record
    try {
      const existingPayment = await Payment.findOne({ 
        transactionId: orderId,
        userId: userId
      });

      console.log("Existing payment record:", existingPayment);

      if (existingPayment && existingPayment.status === "success") {
        console.log("✅ Payment already marked as successful in database");
        
        try {
          // Get user details
          const userAfter = await User.findById(userId);
          console.log("User after payment:", userAfter);
          
          // Get plan details
          const plan = await PricingPlan.findOne({ planId: existingPayment.planId });
          console.log("Plan found:", plan);

          return res.status(200).json({
            success: true,
            message: "Payment already verified and plan upgraded!",
            orderStatus: "PAID",
            orderAmount: existingPayment.amount,
            orderCurrency: existingPayment.currency,
            planId: existingPayment.planId,
            planName: existingPayment.planName,
            billingCycle: existingPayment.billingCycle,
            user: {
              id: userAfter._id,
              email: userAfter.email,
              plan: userAfter.plan,
              planId: userAfter.planId,
              currentPlanId: userAfter.currentPlanId,
              billingCycle: userAfter.billingCycle,
              subscriptionStatus: userAfter.subscriptionStatus,
              isPremium: userAfter.isPremium,
              planExpiryDate: userAfter.planExpiryDate,
              lastPaymentDate: userAfter.lastPaymentDate,
              nextPaymentDate: userAfter.nextPaymentDate
            }
          });
        } catch (userError) {
          console.error("Error fetching user/plan:", userError);
          // Continue to Cashfree verification
        }
      }
    } catch (dbError) {
      console.error("Database error in initial check:", dbError);
      // Continue to Cashfree verification
    }

    // If no successful record exists or DB check failed, verify with Cashfree
    try {
      console.log("Attempting to verify with Cashfree API...");
      const cashfreeUrl = `${CASHFREE_BASE_URL}/${orderId}`;
      console.log("Cashfree URL:", cashfreeUrl);
      
      console.log("Cashfree Creds Check:", {
        appId: process.env.CASHFREE_APP_ID ? "SET" : "NOT SET",
        secretKey: process.env.CASHFREE_SECRET_KEY ? "SET" : "NOT SET",
        env: process.env.NODE_ENV
      });

      const response = await axios.get(cashfreeUrl, {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-01-01",
        },
        timeout: 10000
      });

      console.log("Cashfree API response status:", response.status);
      console.log("Cashfree API response data:", response.data);

      const data = response.data;

      // Find or create payment record
      let paymentRecord = await Payment.findOne({ 
        transactionId: orderId,
        userId: userId 
      });

      if (!paymentRecord) {
        console.log("No payment record found, creating one...");
        paymentRecord = new Payment({
          userId,
          transactionId: orderId,
          status: "pending",
          amount: data.order_amount || 0,
          currency: data.order_currency || "INR",
          billingCycle: billingCycle || "monthly"
        });
      }

      // Try to find the plan if planId is provided
      let finalPlanId = null;
      let finalPlanName = "Your Plan";
      
      if (planId) {
        let plan;
        // Try to find by planId string first
        plan = await PricingPlan.findOne({ planId: planId });
        
        // If not found by planId string, try by name
        if (!plan) {
          plan = await PricingPlan.findOne({ name: planId });
        }
        
        // Last resort: try by ObjectId
        if (!plan && mongoose.Types.ObjectId.isValid(planId)) {
          plan = await PricingPlan.findById(planId);
        }
        
        if (plan) {
          finalPlanId = plan.planId;
          finalPlanName = plan.name;
          paymentRecord.planId = plan.planId;
          paymentRecord.planName = plan.name;
        }
      }

      if (data.order_status === "PAID") {
        console.log("✅ Payment verified as PAID by Cashfree");
        
        // Update payment record
        paymentRecord.status = "success";
        paymentRecord.paymentMethod = data.payment_method || "card";
        paymentRecord.paidAt = new Date();
        
        await paymentRecord.save();

        // Update user plan - THIS IS THE CRITICAL UPDATE
        if (paymentRecord.planId) {
          console.log("🔄 Updating user with planId:", paymentRecord.planId);
          const updatedUser = await updateUserPlan(userId, paymentRecord.planId, billingCycle || paymentRecord.billingCycle);
          console.log("✅ User updated successfully:", {
            userId: updatedUser._id,
            email: updatedUser.email,
            currentPlanId: updatedUser.currentPlanId,
            subscriptionStatus: updatedUser.subscriptionStatus
          });
        } else if (finalPlanId) {
          // Fallback to the finalPlanId from earlier logic
          console.log("🔄 Updating user with finalPlanId:", finalPlanId);
          const updatedUser = await updateUserPlan(userId, finalPlanId, billingCycle || paymentRecord.billingCycle);
          console.log("✅ User updated successfully:", {
            userId: updatedUser._id,
            email: updatedUser.email,
            currentPlanId: updatedUser.currentPlanId,
            subscriptionStatus: updatedUser.subscriptionStatus
          });
        }

        // SEND INVOICE EMAIL - NEW FUNCTIONALITY
        console.log("📧 Sending invoice email for transaction:", paymentRecord.transactionId);
        try {
          await sendInvoiceAfterPayment(paymentRecord.transactionId, userId);
          console.log("✅ Invoice email sent successfully");
        } catch (invoiceError) {
          console.error("❌ Failed to send invoice email:", invoiceError);
        }

        // Get updated user
        const userAfter = await User.findById(userId).select('-password');

        console.log("✅ Upgrade completed successfully via Cashfree verification");

        return res.status(200).json({
          success: true,
          message: "Payment verified and plan upgraded successfully! Invoice has been sent to your email.",
          orderStatus: data.order_status,
          orderAmount: data.order_amount || paymentRecord.amount,
          orderCurrency: data.order_currency || paymentRecord.currency,
          planId: paymentRecord.planId,
          planName: paymentRecord.planName,
          billingCycle: paymentRecord.billingCycle,
          user: {
            id: userAfter._id,
            email: userAfter.email,
            plan: userAfter.plan,
            planId: userAfter.planId,
            currentPlanId: userAfter.currentPlanId,
            billingCycle: userAfter.billingCycle,
            subscriptionStatus: userAfter.subscriptionStatus,
            isPremium: userAfter.isPremium,
            planExpiryDate: userAfter.planExpiryDate,
            lastPaymentDate: userAfter.lastPaymentDate,
            nextPaymentDate: userAfter.nextPaymentDate
          }
        });
      }
    } catch (cashfreeError) {
      console.error("Cashfree API Error Details:", {
        message: cashfreeError.message,
        response: cashfreeError.response?.data,
        status: cashfreeError.response?.status,
        url: cashfreeError.config?.url
      });

      // Check database again as fallback
      try {
        const fallbackPayment = await Payment.findOne({ 
          transactionId: orderId,
          userId: userId,
          status: "success"
        });

        if (fallbackPayment) {
          console.log("Fallback: Found successful payment in database");
          
          // Update user plan if not already updated
          const user = await User.findById(userId);
          if (user && fallbackPayment.planId && user.planId !== fallbackPayment.planId) {
            await updateUserPlan(userId, fallbackPayment.planId, fallbackPayment.billingCycle);
          }
          
          // Send invoice email for fallback case too
          try {
            await sendInvoiceAfterPayment(fallbackPayment.transactionId, userId);
            console.log("✅ Invoice email sent for fallback payment");
          } catch (invoiceError) {
            console.error("❌ Failed to send invoice email for fallback:", invoiceError);
          }
          
          const userAfter = await User.findById(userId).select('-password');
          
          return res.status(200).json({
            success: true,
            message: "Payment verified successfully (from database fallback)! Invoice has been sent to your email.",
            orderStatus: "PAID",
            orderAmount: fallbackPayment.amount,
            orderCurrency: fallbackPayment.currency,
            planId: fallbackPayment.planId,
            planName: fallbackPayment.planName,
            billingCycle: fallbackPayment.billingCycle,
            user: {
              id: userAfter._id,
              email: userAfter.email,
              plan: userAfter.plan,
              planId: userAfter.planId,
              currentPlanId: userAfter.currentPlanId,
              billingCycle: userAfter.billingCycle,
              subscriptionStatus: userAfter.subscriptionStatus,
              isPremium: userAfter.isPremium,
              planExpiryDate: userAfter.planExpiryDate,
              lastPaymentDate: userAfter.lastPaymentDate,
              nextPaymentDate: userAfter.nextPaymentDate
            }
          });
        }
      } catch (fallbackError) {
        console.error("Fallback database check failed:", fallbackError);
      }

      // If we reach here, all checks failed
      return res.status(500).json({
        success: false,
        message: "Failed to verify payment. Please contact support with order ID: " + orderId,
        error: cashfreeError.message
      });
    }
  } catch (err) {
    console.error("Unexpected error in verifyPayment:", err);
    console.error("Error stack:", err.stack);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment verification",
      error: err.message
    });
  }
};

module.exports = verifyPayment;