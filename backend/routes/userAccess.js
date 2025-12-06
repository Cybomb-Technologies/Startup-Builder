// routes/accessLevelRoutes.js (or wherever your routes are)
const express = require('express');
const {
  getAccessLevels,
  createAccessLevel,
  updateAccessLevel,
  deleteAccessLevel
} = require('../controllers/userAccess/userAccessController');  // Updated path

const router = express.Router();

router.route('/')
  .get(getAccessLevels)
  .post(createAccessLevel);

router.route('/:id')
  .put(updateAccessLevel)
  .delete(deleteAccessLevel);

module.exports = router;