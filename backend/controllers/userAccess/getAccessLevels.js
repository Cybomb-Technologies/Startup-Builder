// controllers/userAccess/getAccessLevels.js
const UserAccess = require('../../models/UserAccess');
const asyncHandler = require('express-async-handler');

// @desc    Get all user access levels
// @route   GET /api/admin/access-levels
// @access  Private/Admin
const getAccessLevels = asyncHandler(async (req, res) => {
  const accessLevels = await UserAccess.find({}).sort({ price: 1 });

  res.status(200).json({
    success: true,
    count: accessLevels.length,
    accessLevels
  });
});

module.exports = getAccessLevels;