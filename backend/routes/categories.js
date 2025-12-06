// routes/categoryRoutes.js
const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category/categoryController');
const { adminProtect } = require('../middleware/adminauth');

const router = express.Router();

// All routes are protected and require admin authentication
router.use(adminProtect);

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;