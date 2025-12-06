// register.js
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email 
      },
      process.env.JWT_SECRET || 'your-fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email,
        plan: newUser.plan,
        planId: newUser.planId,
        isPremium: newUser.isPremium
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};