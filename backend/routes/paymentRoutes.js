// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  verifyPayment, 
  handlePaymentWebhook, 
  getUserPayments,
  getUserPlanDetails,
  downloadInvoice
} = require('../controllers/payment/paymentController'); // Updated path
const auth = require('../middleware/auth');

// Payment routes
router.post('/create', auth, createOrder);
router.post('/verify', auth, verifyPayment);
router.post('/webhook', handlePaymentWebhook);
router.get('/user-payments', auth, getUserPayments);
router.get('/plan-details', auth, getUserPlanDetails); // New route for plan details

// NEW: Invoice download route
router.get('/invoice/:transactionId', auth, downloadInvoice);

module.exports = router;