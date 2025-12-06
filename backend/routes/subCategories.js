// routes/subCategoryRoutes.js (if you have a separate file)
const express = require('express');
const {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
} = require('../controllers/subCategory/subCategoryController'); // Updated path
const { adminProtect } = require('../middleware/adminauth');

const router = express.Router();

// All routes are protected and require admin authentication
router.use(adminProtect);

router.route('/')
  .get(getSubCategories)
  .post(createSubCategory);

router.route('/:id')
  .put(updateSubCategory)
  .delete(deleteSubCategory);

module.exports = router;