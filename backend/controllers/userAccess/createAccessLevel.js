// controllers/userAccess/createAccessLevel.js
const UserAccess = require('../../models/UserAccess');
const asyncHandler = require('express-async-handler');

// @desc    Create a user access level
// @route   POST /api/admin/access-levels
// @access  Private/Admin
const createAccessLevel = asyncHandler(async (req, res) => {
  const { name, description, permissions, price } = req.body;

  const accessLevelExists = await UserAccess.findOne({ name });
  if (accessLevelExists) {
    return res.status(400).json({
      success: false,
      message: 'Access level already exists'
    });
  }

  const accessLevel = await UserAccess.create({
    name,
    description,
    permissions,
    price
  });

  res.status(201).json({
    success: true,
    message: 'Access level created successfully',
    accessLevel
  });
});

module.exports = createAccessLevel;