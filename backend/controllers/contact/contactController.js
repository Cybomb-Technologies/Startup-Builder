// controllers/contact/contactController.js
const getAllSubmissions = require('./getAllSubmissions');
const submitContactForm = require('./submitContactForm');
const deleteSubmission = require('./deleteSubmission');
const updateReadStatus = require('./updateReadStatus');

module.exports = {
  getAllSubmissions,
  submitContactForm,
  deleteSubmission,
  updateReadStatus
};