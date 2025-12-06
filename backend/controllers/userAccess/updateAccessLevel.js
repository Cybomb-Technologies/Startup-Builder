// controllers/userAccess/updateAccessLevel.js
const UserAccess = require('../../models/UserAccess');
const asyncHandler = require('express-async-handler');

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

module.exports = updateAccessLevel;