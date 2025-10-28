require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/users');
const newsletterRoutes = require("./routes/newsletterRoutes");

// Initialize Express
const app = express();

// -------------------- Security Middleware --------------------
app.use(helmet());

// -------------------- Rate Limiting --------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// ✅ Correct route definition
// ✅ REPLACE with this debug version
app.post('/api/admin', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    console.log('Looking for admin with email:', email);
    
    // Your authentication logic here
    // TEMPORARY: Simple authentication for testing
    if (email === 'admin@example.com' && password === 'password') {
      return res.json({
        success: true,
        message: 'Login successful',
        token: 'temp-jwt-token-for-testing'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// -------------------- CORS Configuration --------------------
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // ⚠️ Changed from 3001 to 3000
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// -------------------- Parsers --------------------
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// -------------------- Connect Database --------------------
connectDB();

// -------------------- Base Route --------------------
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

// -------------------- API Routes --------------------
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/newsletter', newsletterRoutes); // ⚠️ ADDED THIS MISSING LINE

console.log("✅ Admin routes mounted at /api/admin");
console.log("✅ User routes mounted at /api/users");
console.log("✅ Newsletter routes mounted at /api/newsletter"); // ⚠️ ADDED THIS

// -------------------- Error Handling --------------------
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// -------------------- 404 Handler --------------------
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5001; // ⚠️ Changed from 5000 to 5001
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`)); // ⚠️ Added '0.0.0.0'