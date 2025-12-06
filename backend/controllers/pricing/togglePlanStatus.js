// controllers/pricing/togglePlanStatus.js
const Pricing = require('../../models/PricingPlan');

// Toggle plan status
const togglePlanStatus = async (req, res) => {
  try {
    const plan = await Pricing.findOne({ planId: req.params.planId });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }
    
    plan.active = !plan.active;
    await plan.save();
    
    res.json({
      success: true,
      message: `Plan ${plan.active ? 'activated' : 'deactivated'} successfully`,
      plan
    });
  } catch (error) {
    console.error('Error toggling plan status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating plan status'
    });
  }
};

module.exports = togglePlanStatus;