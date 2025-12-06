// controllers/payment/helpers.js
const mongoose = require("mongoose");
const PricingPlan = require("../../models/PricingPlan");

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

module.exports = {
  calculateExpiryDate,
  calculateAmountFromPlan
};