// controllers/fileType/fileTypeController.js
const getFileTypes = require('./getFileTypes');
const createFileType = require('./createFileType');
const updateFileType = require('./updateFileType');
const deleteFileType = require('./deleteFileType');

module.exports = {
  getFileTypes,
  createFileType,
  updateFileType,
  deleteFileType
};