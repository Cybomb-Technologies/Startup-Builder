// controllers/admin/getAdminProfile.js
// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = req.admin;
    
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        companyCode: admin.companyCode,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};

module.exports = getAdminProfile;