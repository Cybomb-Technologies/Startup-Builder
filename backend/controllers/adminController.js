const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const User = require("../models/User");   // ✅ make sure this model exists too
const bcrypt = require("bcryptjs");

require("dotenv").config();

// ✅ Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env file");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, companyCode } = req.body;
    console.log("Register Request:", req.body);

    // Validation
    if (!name || !email || !password || !companyCode) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      companyCode,
    });

    // Generate token
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        companyCode: admin.companyCode,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    
    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }
    
    // MongoDB validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};

// ✅ Login Admin
exports.loginAdmin = async (req, res) => {
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
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};
// ✅ Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    // req.admin is set by the adminProtect middleware
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from MongoDB
    res.status(200).json({
      success: true,
      count: users.length,
      users
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

// ✅ Update Admin Profile
exports.updateAdminProfile = async (req, res) => {
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