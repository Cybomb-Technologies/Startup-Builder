// controllers/payment/updateUserPlan.js
const mongoose = require("mongoose");
const User = require("../../models/User");
const PricingPlan = require("../../models/PricingPlan");

// Update User Plan after successful payment
const updateUserPlan = async (userId, planId, billingCycle) => {
  try {
    console.log(`🔄 Starting user plan update for user ${userId}, plan ${planId}, cycle ${billingCycle}`);
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    // Get plan details
    let plan;
    plan = await PricingPlan.findOne({ planId: planId });
    
    if (!plan) {
      plan = await PricingPlan.findOne({ name: planId });
    }
    
    if (!plan && mongoose.Types.ObjectId.isValid(planId)) {
      plan = await PricingPlan.findById(planId);
    }
    
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }
    
    console.log("Plan found for update:", {
      planName: plan.name,
      planId: plan.planId,
      isPremium: plan.isPremium || false
    });
    
    // Calculate expiry date
    const now = new Date();
    let expiryDate;
    if (billingCycle === "annual") {
      expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      expiryDate = new Date(now.setMonth(now.getMonth() + 1));
    }
    
    // Update user plan fields directly
    user.plan = plan.name;
    user.planId = plan.planId;
    user.currentPlanId = plan.planId;
    user.billingCycle = billingCycle;
    user.subscriptionStatus = 'active';
    user.isPremium = plan.isPremium || false;
    user.planExpiryDate = expiryDate;
    user.lastPaymentDate = new Date();
    
    // Calculate next payment date
    const nextDate = new Date();
    if (billingCycle === 'annual') {
      user.nextPaymentDate = new Date(nextDate.setFullYear(nextDate.getFullYear() + 1));
    } else {
      user.nextPaymentDate = new Date(nextDate.setMonth(nextDate.getMonth() + 1));
    }
    
    console.log("User update details:", {
      userId: user._id,
      email: user.email,
      oldPlan: user.plan,
      oldPlanId: user.planId,
      newPlan: plan.name,
      newPlanId: plan.planId,
      currentPlanId: user.currentPlanId,
      subscriptionStatus: user.subscriptionStatus,
      isPremium: user.isPremium,
      planExpiryDate: user.planExpiryDate,
      billingCycle: user.billingCycle
    });
    
    // Save the user
    await user.save();
    
    console.log('✅ User plan updated successfully in database');
    return user;
  } catch (error) {
    console.error("❌ Error updating user plan:", error);
    throw error;
  }
};

module.exports = updateUserPlan;