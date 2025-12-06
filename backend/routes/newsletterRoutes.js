// routes/newsletterRoutes.js (or wherever your newsletter routes are)
const express = require('express');
const router = express.Router();
const { subscribe, getSubscribers } = require('../controllers/newsletter/newsletterController'); // Updated path
const { adminProtect } = require('../middleware/adminauth');

// Public routes
router.post('/subscribe', subscribe);

// Admin protected routes
router.get('/subscribers', adminProtect, getSubscribers);

module.exports = router;