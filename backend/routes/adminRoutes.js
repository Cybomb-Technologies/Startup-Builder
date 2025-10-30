const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdmin, getAdminProfile, updateAdminProfile, getAllUsers } = require('../controllers/adminController');
const { adminProtect } = require('../middleware/authmiddleware');

// Auth routes
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);

// Protected routes
router.get('/profile', adminProtect, getAdminProfile);
router.put('/profile', adminProtect, updateAdminProfile);
router.get('/users', adminProtect, getAllUsers);

module.exports = router;
