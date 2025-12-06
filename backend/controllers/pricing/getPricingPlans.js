// controllers/pricing/getPricingPlans.js
const Pricing = require('../../models/PricingPlan');

// Get all pricing plans (public - only active)
const getPricingPlans = async (req, res) => {
  try {
    const plans = await Pricing.find({ active: true })
      .sort({ position: 1 });
    
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

module.exports = getPricingPlans;