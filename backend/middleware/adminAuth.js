const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Domains allowed without token
const allowedOrigins = [
  "http://localhost:5173",
  "https://cybombadmin.cybomb.com"
];

const adminProtect = async (req, res, next) => {
  try {
    const origin = req.headers.origin;

    // Allow same bypass for admin routes
    if (allowedOrigins.includes(origin)) {
      console.log("Bypassed admin token (allowed origin):", origin);
      return next();
    }

    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('🔐 Auth Middleware - Token received:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided, please login'
      });
    }

    try {
      // Verify token with detailed error handling
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded successfully, admin ID:', decoded.id);

      // Find admin and exclude password
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        console.log('❌ Admin not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Admin account not found'
        });
      }

      console.log('✅ Admin authenticated:', req.admin.email);
      next();
    } catch (jwtError) {
      console.error('❌ JWT Verification Error:', jwtError.message);

      // Specific error messages for different JWT errors
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format, please login again'
        });
      } else if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired, please login again'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed'
        });
      }
    }
  } catch (error) {
    console.error('❌ Admin Auth Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = { adminProtect };