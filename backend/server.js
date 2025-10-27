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

// Initialize Express
const app = express();
app.use(cors()); // ✅ allow all cross-origin requests

// -------------------- Security Middleware --------------------
app.use(helmet());

// -------------------- Rate Limiting --------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// -------------------- CORS Configuration --------------------
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
// ✅ Use clean prefixes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
console.log("✅ Admin routes mounted at /api/admin");


// -------------------- Error Handling --------------------
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});



// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// -------------------- 404 Handler --------------------

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});