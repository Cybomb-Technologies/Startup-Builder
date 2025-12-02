const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// ✅ REGISTER USER
router.post('/register', userController.register);

// ✅ LOGIN USER
router.post('/login', userController.login);

// ✅ TOKEN VALIDATION ROUTE
router.get('/validate-token', auth, userController.validateToken);

// ✅ GET USER DOCUMENTS (For Dashboard)
router.get('/documents', auth, userController.getUserDocuments);

// ✅ GET USER STATISTICS (For Dashboard Cards)
router.get('/stats', auth, userController.getUserStats);

// ✅ CREATE USER DOCUMENT WHEN TEMPLATE IS DOWNLOADED/EDITED
router.post('/templates/:id/download', auth, userController.downloadTemplate);

// ✅ GET SINGLE USER DOCUMENT
router.get('/documents/:id', auth, userController.getUserDocument);

// ✅ UPDATE USER DOCUMENT
router.put('/documents/:id', auth, userController.updateUserDocument);

// ✅ DELETE USER DOCUMENT
router.delete('/documents/:id', auth, userController.deleteUserDocument);

// ✅ GET USER PROFILE WITH EXTENDED INFO
router.get('/profile/extended', auth, userController.getExtendedProfile);

// ✅ OTP Forgot Password Route
router.post('/forgot-password', userController.forgotPassword);

// ✅ OTP Verification Route
router.post('/verify-otp', userController.verifyOtp);

// ✅ Reset Password with Token
router.post('/reset-password', userController.resetPassword);

// ✅ TEMPLATE DOWNLOAD - ACCESS CHECKS DISABLED
router.get('/templates/:id/download', auth, userController.downloadTemplateFile);

// ✅ GET TEMPLATE PREVIEW - ACCESS CHECKS DISABLED
router.get('/templates/:id/preview', auth, userController.getTemplatePreview);

// ✅ GET ALL TEMPLATES
router.get('/templates', userController.getAllTemplates);

// ✅ GET USER PROFILE
router.get('/profile', auth, userController.getProfile);

// ✅ Test OTP Generation Route
router.post('/test-otp', userController.testOtp);

// ✅ GET USER PLAN DETAILS
router.get('/plan-details', auth, userController.getUserPlanDetails);

// ✅ CHECK TEMPLATE ACCESS
router.get('/template-access/:templateId', auth, userController.checkTemplateAccess);

// ✅ GET USER CURRENT PLAN INFO
router.get('/current-plan', auth, userController.getUserCurrentPlan);

module.exports = router;
