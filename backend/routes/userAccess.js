const express = require('express');
const {
  getAccessLevels,
  createAccessLevel,
  updateAccessLevel,
  deleteAccessLevel
} = require('../controllers/userAccessController');

const router = express.Router();

router.route('/')
  .get(getAccessLevels)
  .post(createAccessLevel);

router.route('/:id')
  .put(updateAccessLevel)
  .delete(deleteAccessLevel);

module.exports = router;