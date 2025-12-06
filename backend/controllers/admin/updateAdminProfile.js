// controllers/admin/updateAdminProfile.js
// Update Admin Profile
const updateAdminProfile = async (req, res) => {
  try {
    const admin = req.admin;
    const { name, email, companyCode } = req.body;

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (companyCode) admin.companyCode = companyCode;

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        companyCode: admin.companyCode,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};

module.exports = updateAdminProfile;