// controllers/pricing/pricingController.js
const getPricingPlans = require('./getPricingPlans');
const getAllPricingPlans = require('./getAllPricingPlans');
const getPricingPlan = require('./getPricingPlan');
const createPricingPlan = require('./createPricingPlan');
const updatePricingPlan = require('./updatePricingPlan');
const deletePricingPlan = require('./deletePricingPlan');
const togglePlanStatus = require('./togglePlanStatus');

module.exports = {
  getPricingPlans,
  getAllPricingPlans,
  getPricingPlan,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  togglePlanStatus
};