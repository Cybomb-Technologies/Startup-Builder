const express = require('express');
const router = express.Router();
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
const { adminProtect } = require('../middleware/adminauth');

// Add route logging middleware for debugging
router.use((req, res, next) => {
  console.log('📡 Template Route Hit:', {
    method: req.method,
    url: req.url,
    path: req.path,
    params: req.params
  });
  next();
});

// Template CRUD routes
router.route('/')
  .get(adminProtect, getTemplates)
  .post(adminProtect, createTemplate);

// Image management routes - MUST COME BEFORE PARAM ROUTES
router.route('/:id/images')
  .post(adminProtect, uploadTemplateImages);

router.route('/:id/images/reorder')
  .put(adminProtect, reorderImages);

router.route('/:id/images/:imageId/primary')
  .put(adminProtect, setPrimaryImage);

router.route('/:id/images/:imageId')
  .get(getTemplateImage)  // Public access for viewing images
  .delete(adminProtect, deleteTemplateImage);

// File management routes
router.route('/:id/download')
  .get(adminProtect, downloadTemplateFile);

router.route('/:id/file-info')
  .get(adminProtect, getTemplateFileInfo);

router.route('/:id/file')
  .delete(adminProtect, deleteTemplateFile);

// Template CRUD routes
router.route('/:id')
  .put(adminProtect, updateTemplate)
  .delete(adminProtect, deleteTemplate);

module.exports = router;