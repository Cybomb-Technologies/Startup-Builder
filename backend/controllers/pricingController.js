// backend/controllers/pricingController.js
const Pricing = require('../models/Pricing');

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

module.exports = {
  getPricingPlans,
  getAllPricingPlans,
  getPricingPlan,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  togglePlanStatus
};