// controllers/pricing/getAllPricingPlans.js
const Pricing = require('../../models/PricingPlan');

// Get all pricing plans (admin - all plans)
const getAllPricingPlans = async (req, res) => {
  try {
    const plans = await Pricing.find().sort({ position: 1 });
    
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing plans'
    });
  }
};

module.exports = getAllPricingPlans;