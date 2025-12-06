// controllers/payment/createOrder.js
const axios = require("axios");
const Payment = require("../../models/Payment");
const User = require("../../models/User");
const { calculateExpiryDate, calculateAmountFromPlan } = require('./helpers');

const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com/pg/orders";

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

module.exports = createOrder;