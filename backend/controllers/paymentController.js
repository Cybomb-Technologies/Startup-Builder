const axios = require("axios");
const mongoose = require("mongoose");
const PricingPlan = require("../models/PricingPlan");
const User = require("../models/User");
const Payment = require("../models/Payment");
const userController = require("./userController");
const { sendInvoiceAfterPayment } = require("../controllers/invoiceController"); // NEW IMPORT
require("dotenv").config();

const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com/pg/orders";
const EXCHANGE_RATE = process.env.EXCHANGE_RATE ? Number(process.env.EXCHANGE_RATE) : 83.5;

// Helper function to calculate expiry date
const calculateExpiryDate = (billingCycle) => {
  const now = new Date();
  if (billingCycle === "annual") {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  } else {
    return new Date(now.setMonth(now.getMonth() + 1));
  }
};

// Calculate amount based on plan and billing cycle
const calculateAmountFromPlan = async (planId, billingCycle, currency) => {
  console.log("Calculating amount for plan:", { planId, billingCycle, currency });
  
  let plan;
  
  // First try to find by planId string (like "free", "pro")
  plan = await PricingPlan.findOne({ planId: planId });
  
  // If not found by planId, try by name
  if (!plan) {
    plan = await PricingPlan.findOne({ name: planId });
  }
  
  // Last resort: try by ObjectId
  if (!plan && mongoose.Types.ObjectId.isValid(planId)) {
    plan = await PricingPlan.findById(planId);
  }

  if (!plan) {
    throw new Error(`Plan not found. Searched for: ${planId}`);
  }

  let amount;
  let finalCurrency = currency;

  if (billingCycle === "annual") {
    amount = plan.yearlyPrice;
  } else {
    amount = plan.monthlyPrice;
  }

  // Convert to INR if needed
  if (currency === "INR") {
    amount = Math.round(amount);
    finalCurrency = "INR";
  }

  console.log("Final calculated amount:", {
    planName: plan.name,
    planId: plan.planId,
    originalAmount: billingCycle === "annual" ? plan.yearlyPrice : plan.monthlyPrice,
    convertedAmount: amount,
    currency: finalCurrency,
  });

  return { amount, currency: finalCurrency, plan };
};

// Update User Plan after successful payment
const updateUserPlan = async (userId, planId, billingCycle) => {
  try {
    console.log(`🔄 Starting user plan update for user ${userId}, plan ${planId}, cycle ${billingCycle}`);
    
    // Use the userController's update function
    const updatedUser = await userController.updateUserPlanAfterPayment(userId, planId, billingCycle);
    
    console.log("✅ User plan update completed successfully:", {
      userId: updatedUser._id,
      email: updatedUser.email,
      newPlan: updatedUser.plan,
      planId: updatedUser.planId,
      currentPlanId: updatedUser.currentPlanId,
      billingCycle: updatedUser.billingCycle,
      subscriptionStatus: updatedUser.subscriptionStatus,
      isPremium: updatedUser.isPremium,
      planExpiryDate: updatedUser.planExpiryDate,
      lastPaymentDate: updatedUser.lastPaymentDate,
      nextPaymentDate: updatedUser.nextPaymentDate
    });

    return updatedUser;
  } catch (error) {
    console.error("❌ Error updating user plan:", error);
    throw error;
  }
};

// Create Order
const createOrder = async (req, res) => {
  try {
    const { planId, billingCycle = "monthly", currency = "USD" } = req.body;

    console.log("=== CREATE ORDER REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Authenticated user:", req.user);

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Please login again.",
      });
    }

    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User found:", user.email);
    console.log("Current user plan:", user.plan, "planId:", user.planId);
    console.log("Looking for plan with ID:", planId);

    try {
      // Calculate amount and get plan
      const { amount, currency: orderCurrency, plan } = await calculateAmountFromPlan(planId, billingCycle, currency);

      if (!plan) {
        return res.status(400).json({
          success: false,
          message: `Invalid plan selected: ${planId}`,
        });
      }

      console.log("Plan found:", plan.name, "with planId:", plan.planId);

      // Check if user already has this plan active
      const activePayment = await Payment.findOne({
        userId: userId,
        planId: plan.planId,
        status: 'success',
        expiryDate: { $gt: new Date() }
      });

      if (activePayment) {
        return res.status(400).json({
          success: false,
          message: `You already have an active ${billingCycle} subscription for the ${plan.name} plan`,
        });
      }

      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid plan pricing (${amount}). Please contact support.`,
        });
      }

      const orderId = `ORDER_${Date.now()}_${userId}`;

      const orderPayload = {
        order_id: orderId,
        order_amount: amount,
        order_currency: orderCurrency,
        customer_details: {
          customer_id: userId.toString(),
          customer_name: user.username || "Customer",
          customer_email: user.email || "customer@example.com",
          customer_phone: "9999999999",
        },
        order_note: `Plan: ${plan.name}, Billing: ${billingCycle}, Currency: ${orderCurrency}`,
        order_meta: {
          return_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/result?order_id={order_id}`,
          notify_url: `${process.env.API_URL || "http://localhost:5000"}/api/payments/webhook`,
        },
      };

      console.log("Creating Cashfree order with payload:", {
        order_id: orderPayload.order_id,
        order_amount: orderPayload.order_amount,
        order_currency: orderPayload.order_currency,
      });

      // Create payment record first (before calling Cashfree)
      const expiryDate = calculateExpiryDate(billingCycle);
      
      const paymentRecord = new Payment({
        userId,
        amount,
        currency: orderCurrency,
        status: "pending",
        transactionId: orderId,
        expiryDate: expiryDate,
        planId: plan.planId,
        planName: plan.name,
        billingCycle,
        autoRenewal: true,
        renewalStatus: "scheduled",
      });

      await paymentRecord.save();

      console.log("✅ Payment record created successfully with ID:", paymentRecord._id);
      console.log("Payment record details:", {
        planId: paymentRecord.planId,
        planName: paymentRecord.planName,
        billingCycle: paymentRecord.billingCycle,
        expiryDate: paymentRecord.expiryDate
      });

      // Now create Cashfree order
      let cashfreeResponse;
      try {
        cashfreeResponse = await axios.post(CASHFREE_BASE_URL, orderPayload, {
          headers: {
            "x-client-id": process.env.CASHFREE_APP_ID,
            "x-client-secret": process.env.CASHFREE_SECRET_KEY,
            "x-api-version": "2022-01-01",
            "Content-Type": "application/json",
          },
        });
        
        console.log("Cashfree response:", cashfreeResponse.data);
        
      } catch (cashfreeError) {
        console.error("Cashfree API Error:", {
          message: cashfreeError.message,
          response: cashfreeError.response?.data,
          status: cashfreeError.response?.status
        });
        
        // Update payment record to failed
        paymentRecord.status = "failed";
        paymentRecord.paymentMethod = "cashfree_error";
        await paymentRecord.save();
        
        throw new Error(`Cashfree API error: ${cashfreeError.response?.data?.message || cashfreeError.message}`);
      }

      return res.json({
        success: true,
        paymentLink: cashfreeResponse.data.payment_link,
        orderId: cashfreeResponse.data.order_id || orderId,
        amount,
        currency: orderCurrency,
        planId: plan.planId,
        planName: plan.name,
        billingCycle,
        paymentRecordId: paymentRecord._id
      });

    } catch (planError) {
      console.error("Plan calculation error:", planError);
      return res.status(400).json({
        success: false,
        message: `Error with plan: ${planError.message}`,
        details: planError.message
      });
    }

  } catch (err) {
    console.error("Create Order Error:", {
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });
    
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create order",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

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
          billingCycle: billingCycle || "monthly",
          expiryDate: calculateExpiryDate(billingCycle || "monthly")
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
        if (finalPlanId) {
          await updateUserPlan(userId, finalPlanId, paymentRecord.billingCycle);
        }

        // SEND INVOICE EMAIL - NEW FUNCTIONALITY
        console.log("📧 Sending invoice email for transaction:", paymentRecord.transactionId);
        try {
          // This will generate PDF and send email
          await sendInvoiceAfterPayment(paymentRecord.transactionId, userId);
          console.log("✅ Invoice email sent successfully");
        } catch (invoiceError) {
          console.error("❌ Failed to send invoice email:", invoiceError);
          // Don't fail the payment if email fails
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
      } else {
        console.log("Payment status from Cashfree:", data.order_status);
        
        // Update payment status based on Cashfree response
        paymentRecord.status = data.order_status === "ACTIVE" ? "pending" : "failed";
        paymentRecord.paymentMethod = data.payment_method || "unknown";
        await paymentRecord.save();

        return res.status(200).json({
          success: false,
          message: `Payment status: ${data.order_status}`,
          orderStatus: data.order_status,
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

        // CRITICAL: Update user plan via webhook too
        console.log("🔄 Webhook: Updating user plan with:", {
          userId: paymentRecord.userId,
          planId: paymentRecord.planId,
          billingCycle: paymentRecord.billingCycle
        });
        
        await updateUserPlan(paymentRecord.userId, paymentRecord.planId, paymentRecord.billingCycle);

        // SEND INVOICE EMAIL VIA WEBHOOK - NEW FUNCTIONALITY
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
      userId: userId,
      status: 'success'
    }).sort({ createdAt: -1 });

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

// Get user plan details
const getUserPlanDetails = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get active payment
    const activePayment = await Payment.findOne({
      userId: userId,
      status: 'success'
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      user: {
        plan: user.plan,
        planId: user.planId,
        currentPlanId: user.currentPlanId,
        subscriptionStatus: user.subscriptionStatus,
        isPremium: user.isPremium,
        planExpiryDate: user.planExpiryDate,
        billingCycle: user.billingCycle,
        lastPaymentDate: user.lastPaymentDate,
        nextPaymentDate: user.nextPaymentDate,
        accessLevel: user.accessLevel
      },
      paymentDetails: activePayment ? {
        planName: activePayment.planName,
        planId: activePayment.planId,
        billingCycle: activePayment.billingCycle,
        amount: activePayment.amount,
        currency: activePayment.currency,
        expiryDate: activePayment.expiryDate,
        autoRenewal: activePayment.autoRenewal,
        paymentDate: activePayment.paidAt
      } : null
    });
  } catch (error) {
    console.error("Error fetching user plan details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user plan details",
    });
  }
};

// NEW: Get invoice download endpoint
const downloadInvoice = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    // Import invoice controller
    const { generateInvoice } = require("./invoiceController");
    
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

module.exports = {
  createOrder,
  verifyPayment,
  handlePaymentWebhook,
  getUserPayments,
  getUserPlanDetails,
  updateUserPlan,
  downloadInvoice // NEW EXPORT
};