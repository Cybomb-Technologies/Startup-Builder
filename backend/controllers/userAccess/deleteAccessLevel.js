// controllers/userAccess/deleteAccessLevel.js
const UserAccess = require('../../models/UserAccess');
const asyncHandler = require('express-async-handler');

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
  const User = require('../../models/User');
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

module.exports = deleteAccessLevel;