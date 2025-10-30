require('dotenv').config();
const express = require('express');
const cors = require('cors'); // ✅ Only declare once
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const contactRoutes = require('./routes/contactRoutes');


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

// Specific rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many attempts, please try again later.'
  }
});

// -------------------- CORS Configuration --------------------
const corsOptions = {
  origin: 'http://localhost:3000', // or your frontend URL
  credentials: true
};
app.use(cors(corsOptions)); // ✅ Use the corsOptions variable

// -------------------- Parsers --------------------
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// -------------------- Connect Database --------------------
connectDB();

// -------------------- Base Route --------------------
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'StartupDocs Builder API is running...',
    version: '1.0.0'
  });
});

// -------------------- Health Check Route --------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// -------------------- API Routes --------------------
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes); // ✅ Only mount once
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);


console.log("✅ Admin routes mounted at /api/admin");
console.log("✅ User routes mounted at /api/users");
console.log("✅ Newsletter routes mounted at /api/newsletter");
console.log("✅ Contact routes mounted at /api/contact");


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
  res.status(404).json({ 
    success: false, 
    message: 'API route not found',
    availableEndpoints: {
      admin: '/api/admin',
      users: '/api/users',
      newsletter: '/api/newsletter',
      // ✅ Now include the specific user endpoints
      userLogin: '/api/users/login',
      userForgotPassword: '/api/users/forgot-password',
      userResetPassword: '/api/users/reset-password'
    }
  });
});
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startup', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('✅ Connected to MongoDB: startup database'))
// .catch(err => console.error('❌ MongoDB connection error:', err));

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`✅ Available user routes: login, forgot-password, reset-password`);
});