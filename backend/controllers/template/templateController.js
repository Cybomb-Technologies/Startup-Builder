// controllers/template/templateController.js
const getTemplates = require('./getTemplates');
const createTemplate = require('./createTemplate');
const updateTemplate = require('./updateTemplate');
const deleteTemplate = require('./deleteTemplate');
const downloadTemplateFile = require('./downloadTemplateFile');
const deleteTemplateFile = require('./deleteTemplateFile');
const getTemplateFileInfo = require('./getTemplateFileInfo');
const uploadTemplateImages = require('./uploadTemplateImages');
const getTemplateImage = require('./getTemplateImage');
const deleteTemplateImage = require('./deleteTemplateImage');
const setPrimaryImage = require('./setPrimaryImage');
const reorderImages = require('./reorderImages');

module.exports = {
  // CRUD Operations
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  
  // File Management
  downloadTemplateFile,
  deleteTemplateFile,
  getTemplateFileInfo,
  
  // Image Management
  uploadTemplateImages,
  getTemplateImage,
  deleteTemplateImage,
  setPrimaryImage,
  reorderImages
};