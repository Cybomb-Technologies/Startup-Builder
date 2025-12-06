// controllers/pricing/updatePricingPlan.js
const Pricing = require('../../models/PricingPlan');

// Update pricing plan
const updatePricingPlan = async (req, res) => {
  try {
    const plan = await Pricing.findOneAndUpdate(
      { planId: req.params.planId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Pricing plan updated successfully',
      plan
    });
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pricing plan'
    });
  }
};

module.exports = updatePricingPlan;