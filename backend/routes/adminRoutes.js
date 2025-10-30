const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminauth');

// Import ALL controllers including image management
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

// Import template controller with ALL functions including image management
const {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  downloadTemplateFile,
  deleteTemplateFile,
  getTemplateFileInfo,
  // IMAGE MANAGEMENT CONTROLLERS
  uploadTemplateImages,
  getTemplateImage,
  deleteTemplateImage,
  setPrimaryImage,
  reorderImages
} = require('../controllers/templateController');

// ==================== ROUTE LOGGING MIDDLEWARE ====================
router.use((req, res, next) => {
  console.log('📡 Admin Route Hit:', {
    method: req.method,
    url: req.url,
    path: req.path,
    timestamp: new Date().toISOString()
  });
  next();
});

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

// ==================== CATEGORY MANAGEMENT ROUTES ====================
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ==================== SUBCATEGORY MANAGEMENT ROUTES ====================
router.get('/subcategories', getSubCategories);
router.post('/subcategories', createSubCategory);
router.put('/subcategories/:id', updateSubCategory);
router.delete('/subcategories/:id', deleteSubCategory);

// ==================== FILE TYPE MANAGEMENT ROUTES ====================
router.get('/file-types', getFileTypes);
router.post('/file-types', createFileType);
router.put('/file-types/:id', updateFileType);
router.delete('/file-types/:id', deleteFileType);

// ==================== ACCESS LEVEL MANAGEMENT ROUTES ====================
router.get('/access-levels', getAccessLevels);
router.post('/access-levels', createAccessLevel);
router.put('/access-levels/:id', updateAccessLevel);
router.delete('/access-levels/:id', deleteAccessLevel);

// ==================== TEMPLATE MANAGEMENT ROUTES ====================

// Template CRUD routes
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);

// ========== TEMPLATE IMAGE MANAGEMENT ROUTES ==========
// Note: These must come before generic :id routes to avoid conflicts

// Upload multiple images for a template
router.post('/templates/:id/images', uploadTemplateImages);

// Reorder template images
router.put('/templates/:id/images/reorder', reorderImages);

// Set primary image for a template
router.put('/templates/:id/images/:imageId/primary', setPrimaryImage);

// Delete specific image from template
router.delete('/templates/:id/images/:imageId', deleteTemplateImage);

// ========== TEMPLATE FILE MANAGEMENT ROUTES ==========

// Download template file
router.get('/templates/:id/download', downloadTemplateFile);

// Get template file info (for debugging)
router.get('/templates/:id/file-info', getTemplateFileInfo);

// Delete template file (keep template, remove file only)
router.delete('/templates/:id/file', deleteTemplateFile);

// ========== TEMPLATE CRUD ROUTES (should come last) ==========

// Update template (general updates)
router.put('/templates/:id', updateTemplate);

// Delete template and all associated files/images
router.delete('/templates/:id', deleteTemplate);

// ==================== HEALTH CHECK ====================
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin API is healthy and running',
    timestamp: new Date().toISOString(),
    routes: {
      templates: '✓',
      categories: '✓',
      subcategories: '✓',
      fileTypes: '✓',
      accessLevels: '✓',
      imageManagement: '✓'
    }
  });
});

module.exports = router;