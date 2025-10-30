const express = require('express');
const router = express.Router();
const { subscribe, getSubscribers } = require('../controllers/newsletterController');
const { adminProtect } = require('../middleware/adminauth');

// Public routes
router.post('/subscribe', subscribe);

// Admin protected routes
router.get('/subscribers', adminProtect, getSubscribers);

module.exports = router;