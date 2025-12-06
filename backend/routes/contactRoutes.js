// routes/contactRoutes.js (or wherever your contact routes are)
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact/contactController'); // Updated path

// ✅ Get all contact form submissions (for admin)
router.get('/submissions', contactController.getAllSubmissions);

// ✅ Submit contact form
router.post('/submit', contactController.submitContactForm);

// ✅ Delete contact submission
router.delete('/:id', contactController.deleteSubmission);

// ✅ Mark as read/unread
router.patch('/:id/read', contactController.updateReadStatus);

module.exports = router;