const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Domains allowed without token
const allowedOrigins = [
  "http://localhost:5173",
  "https://cybombadmin.cybomb.com"
];

module.exports = async function auth(req, res, next) {
  try {
    const origin = req.headers.origin;

    // If request is from allowed domain → skip token check
    if (allowedOrigins.includes(origin)) {
      console.log("Bypassed token (allowed origin):", origin);
      return next();
    }

    const bearer = req.header('Authorization');
    const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : (req.query?.token || null);

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract user ID - support multiple possible field names
    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    // Find user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Add user to request
    req.user = {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      plan: user.plan,
      accessLevel: user.accessLevel
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};