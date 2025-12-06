// controllers/admin/getAllUsers.js
const User = require("../../models/User");

// Get All Users with detailed information including plan
const getAllUsers = async (req, res) => {
  try {
    const { search, plan, status } = req.query;
    
    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (plan && plan !== 'all') {
      filter.planId = plan;
    }
    
    if (status && status !== 'all') {
      if (status === 'premium') {
        filter.isPremium = true;
      } else if (status === 'free') {
        filter.isPremium = false;
      } else if (status === 'active') {
        filter.subscriptionStatus = 'active';
      } else if (status === 'inactive') {
        filter.subscriptionStatus = 'inactive';
      }
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('accessLevel', 'name')
      .sort({ createdAt: -1 });

    // Get unique plan IDs for filter
    const uniquePlans = await User.distinct('planId', { planId: { $ne: null } });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
      filters: {
        plans: uniquePlans,
        statuses: ['all', 'premium', 'free', 'active', 'inactive']
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
};

module.exports = getAllUsers;