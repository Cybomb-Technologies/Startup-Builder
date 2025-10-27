const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select('-password');
      
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }
      
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Admin Auth Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = { adminProtect };