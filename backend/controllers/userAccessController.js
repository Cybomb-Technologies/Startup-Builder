const UserAccess = require('../models/UserAccess');
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

// @desc    Update a user access level
// @route   PUT /api/admin/access-levels/:id
// @access  Private/Admin
const updateAccessLevel = asyncHandler(async (req, res) => {
  const { name, description, permissions, price, isActive } = req.body;

  let accessLevel = await UserAccess.findById(req.params.id);
  if (!accessLevel) {
    return res.status(404).json({
      success: false,
      message: 'Access level not found'
    });
  }

  // Check if name is being changed and if it already exists
  if (name && name !== accessLevel.name) {
    const accessLevelExists = await UserAccess.findOne({ name });
    if (accessLevelExists) {
      return res.status(400).json({
        success: false,
        message: 'Access level name already exists'
      });
    }
  }

  accessLevel = await UserAccess.findByIdAndUpdate(
    req.params.id,
    { name, description, permissions, price, isActive },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Access level updated successfully',
    accessLevel
  });
});

// @desc    Delete a user access level
// @route   DELETE /api/admin/access-levels/:id
// @access  Private/Admin
const deleteAccessLevel = asyncHandler(async (req, res) => {
  const accessLevel = await UserAccess.findById(req.params.id);
  
  if (!accessLevel) {
    return res.status(404).json({
      success: false,
      message: 'Access level not found'
    });
  }

  // Check if any users are using this access level
  const User = require('../models/User');
  const usersCount = await User.countDocuments({ accessLevel: req.params.id });
  
  if (usersCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete access level that is assigned to users'
    });
  }

  await UserAccess.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Access level deleted successfully'
  });
});

module.exports = {
  getAccessLevels,
  createAccessLevel,
  updateAccessLevel,
  deleteAccessLevel
};