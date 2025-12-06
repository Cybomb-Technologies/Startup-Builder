// controllers/admin/adminController.js
const registerAdmin = require('./registerAdmin');
const loginAdmin = require('./loginAdmin');
const getAdminProfile = require('./getAdminProfile');
const updateAdminProfile = require('./updateAdminProfile');
const getAllUsers = require('./getAllUsers');
const getUserDetails = require('./getUserDetails');

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllUsers,
  getUserDetails
};