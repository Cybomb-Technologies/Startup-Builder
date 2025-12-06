// controllers/pricing/getPricingPlan.js
const Pricing = require('../../models/PricingPlan');

// Get single pricing plan
const getPricingPlan = async (req, res) => {
  try {
    const plan = await Pricing.findOne({ planId: req.params.planId });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }
    
    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Error fetching pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing plan'
    });
  }
};

module.exports = getPricingPlan;