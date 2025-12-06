// const User = require('../models/User');

// // @desc    Get all users (for admin)
// // @route   GET /api/admin/users
// // @access  Private/Admin
// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find()
//       .select('-password')
//       .populate('accessLevel', 'name')
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: users.length,
//       users
//     });
//   } catch (error) {
//     console.error('Get users error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching users'
//     });
//   }
// };

// // @desc    Delete user (admin only)
// // @route   DELETE /api/admin/users/:id
// // @access  Private/Admin
// exports.deleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     await User.findByIdAndDelete(req.params.id);

//     res.status(200).json({
//       success: true,
//       message: 'User deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting user'
//     });
//   }
// };