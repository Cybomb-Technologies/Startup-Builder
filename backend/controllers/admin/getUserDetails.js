// controllers/admin/getUserDetails.js
const User = require("../../models/User");

// Get Single User Details
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('accessLevel', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message
    });
  }
};

module.exports = getUserDetails;