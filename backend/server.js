require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// -------------------- Security Middleware --------------------
app.use(helmet());

// -------------------- Rate Limiting --------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// -------------------- CORS Configuration --------------------
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // important for cookies
  };
  app.use(cors(corsOptions));
  
  app.options('*', (req, res, next) => {
    cors(corsOptions)(req, res, next);
  });
    

// -------------------- Body Parser --------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// -------------------- Basic Route --------------------
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

// -------------------- API Routes --------------------
app.use('/api/users', require('./routes/users'));

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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
