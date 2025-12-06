// controllers/admin/loginAdmin.js
const Admin = require("../../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env file");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Find admin
    const admin = await Admin.findOne({ email }).select('+password');
    console.log("Admin found:", admin ? admin.email : "No admin found");

    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        companyCode: admin.companyCode,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};

module.exports = loginAdmin;