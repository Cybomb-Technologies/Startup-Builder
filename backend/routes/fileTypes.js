// routes/fileTypes.js
const express = require('express');
const {
  getFileTypes,
  createFileType,
  updateFileType,
  deleteFileType
} = require('../controllers/fileType/fileTypeController'); // Updated path

const router = express.Router();

router.route('/')
  .get(getFileTypes)
  .post(createFileType);

router.route('/:id')
  .put(updateFileType)
  .delete(deleteFileType);

module.exports = router;