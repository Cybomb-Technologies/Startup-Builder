// controllers/subCategory/subCategoryController.js
const getSubCategories = require('./getSubCategories');
const createSubCategory = require('./createSubCategory');
const updateSubCategory = require('./updateSubCategory');
const deleteSubCategory = require('./deleteSubCategory');

module.exports = {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
};