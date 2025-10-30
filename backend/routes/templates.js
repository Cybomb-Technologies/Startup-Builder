const express = require('express');
const router = express.Router();
const {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  downloadTemplateFile,
  deleteTemplateFile
} = require('../controllers/templateController');
const { adminProtect } = require('../middleware/adminauth');

// Remove multer middleware since we're using express-fileupload
router.route('/templates')
  .get(adminProtect, getTemplates)
  .post(adminProtect, createTemplate); 

router.route('/templates/:id/download')
  .get(adminProtect, downloadTemplateFile);

router.route('/templates/:id/file')
  .delete(adminProtect, deleteTemplateFile);

router.route('/templates/:id')
  .put(adminProtect, updateTemplate) 
  .delete(adminProtect, deleteTemplate);

module.exports = router;