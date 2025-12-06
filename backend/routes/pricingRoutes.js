// routes/pricingRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPricingPlans,
  getAllPricingPlans,
  getPricingPlan,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  togglePlanStatus
} = require('../controllers/pricing/pricingController'); // Updated path
const { adminProtect } = require('../middleware/adminAuth');

// Public routes
router.get('/', getPricingPlans);
router.get('/:planId', getPricingPlan);

// Admin routes - FIXED: Added correct route paths
router.get('/admin/all', adminProtect, getAllPricingPlans);
router.post('/admin/create', adminProtect, createPricingPlan);
router.put('/admin/update/:planId', adminProtect, updatePricingPlan);
router.delete('/admin/delete/:planId', adminProtect, deletePricingPlan);
router.patch('/admin/toggle/:planId', adminProtect, togglePlanStatus);

module.exports = router;