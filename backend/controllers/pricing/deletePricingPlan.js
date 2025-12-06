// controllers/pricing/deletePricingPlan.js
const Pricing = require('../../models/PricingPlan');

// Delete pricing plan
const deletePricingPlan = async (req, res) => {
  try {
    const plan = await Pricing.findOneAndDelete({ planId: req.params.planId });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Pricing plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting pricing plan'
    });
  }
};

module.exports = deletePricingPlan;