// controllers/category/categoryController.js
const getCategories = require('./getCategories');
const createCategory = require('./createCategory');
const updateCategory = require('./updateCategory');
const deleteCategory = require('./deleteCategory');

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};