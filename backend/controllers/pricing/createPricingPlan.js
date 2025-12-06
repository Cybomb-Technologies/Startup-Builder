// controllers/pricing/createPricingPlan.js
const Pricing = require('../../models/PricingPlan');

// Create pricing plan
const createPricingPlan = async (req, res) => {
  try {
    console.log('Creating pricing plan with data:', req.body);
    
    // Calculate position (add to end)
    const count = await Pricing.countDocuments();
    const planData = {
      ...req.body,
      position: count
    };
    
    const plan = new Pricing(planData);
    await plan.save();
    
    res.status(201).json({
      success: true,
      message: 'Pricing plan created successfully',
      plan
    });
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating pricing plan'
    });
  }
};

module.exports = createPricingPlan;