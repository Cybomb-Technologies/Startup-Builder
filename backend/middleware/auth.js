const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function auth(req, res, next) {
  try {
    const bearer = req.header('Authorization');
    const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : (req.query?.token || null);

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id; // support both keys
    if (!userId) throw new Error('Invalid token payload');

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};
