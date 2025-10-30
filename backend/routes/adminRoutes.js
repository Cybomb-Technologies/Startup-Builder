const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminauth');

// Import ALL controllers
const { 
  loginAdmin, 
  registerAdmin, 
  getAdminProfile, 
  updateAdminProfile, 
  getAllUsers 
} = require('../controllers/adminController');

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
} = require('../controllers/subCategoryController');

const {
  getFileTypes,
  createFileType,
  updateFileType,
  deleteFileType
} = require('../controllers/fileTypeController');

const {
  getAccessLevels,
  createAccessLevel,
  updateAccessLevel,
  deleteAccessLevel
} = require('../controllers/userAccessController');

const {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
} = require('../controllers/templateController');

// ==================== PUBLIC ROUTES ====================
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);

// ==================== PROTECTED ROUTES ====================
router.use(adminProtect); // Protect all routes below

// Admin Profile
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

// Users Management
router.get('/users', getAllUsers);

// Categories Routes
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Subcategories Routes
router.get('/subcategories', getSubCategories);
router.post('/subcategories', createSubCategory);
router.put('/subcategories/:id', updateSubCategory);
router.delete('/subcategories/:id', deleteSubCategory);

// File Types Routes
router.get('/file-types', getFileTypes);
router.post('/file-types', createFileType);
router.put('/file-types/:id', updateFileType);
router.delete('/file-types/:id', deleteFileType);

// Access Levels Routes
router.get('/access-levels', getAccessLevels);
router.post('/access-levels', createAccessLevel);
router.put('/access-levels/:id', updateAccessLevel);
router.delete('/access-levels/:id', deleteAccessLevel);

// Templates Routes
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

module.exports = router;