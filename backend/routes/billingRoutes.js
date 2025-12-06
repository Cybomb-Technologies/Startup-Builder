// routes/billingRoutes.js (or wherever your billing routes are)
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getBillingHistory, 
  // getAutoRenewalStatus, 
  // toggleAutoRenewal 
} = require('../controllers/billing/billingController'); // Updated path

// Get billing history
router.get('/history', auth, getBillingHistory);

// Get auto-renewal status
// router.get('/auto-renewal/status', auth, getAutoRenewalStatus);

// Toggle auto-renewal
// router.post('/auto-renewal/toggle', auth, toggleAutoRenewal);

module.exports = router;