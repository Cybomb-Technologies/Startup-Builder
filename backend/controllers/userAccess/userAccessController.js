// controllers/userAccess/userAccessController.js
const getAccessLevels = require('./getAccessLevels');
const createAccessLevel = require('./createAccessLevel');
const updateAccessLevel = require('./updateAccessLevel');
const deleteAccessLevel = require('./deleteAccessLevel');

module.exports = {
  getAccessLevels,
  createAccessLevel,
  updateAccessLevel,
  deleteAccessLevel
};