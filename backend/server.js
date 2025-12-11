// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const fileUpload = require('express-fileupload');

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/users');
const newsletterRoutes = require("./routes/newsletterRoutes");
const publicRoutes = require('./routes/publicRoutes');
const contactRoutes = require('./routes/contactRoutes');
const editorRoutes = require("./routes/editorRoutes");
const pricingRoutes = require('./routes/pricingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const billingRoutes = require('./routes/billingRoutes'); // NEW: Billing routes

// Initialize Express
const app = express();

// Enhanced CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001',
            'http://localhost:8081',
            'http://127.0.0.1:8081',
            process.env.CLIENT_URL
        ].filter(Boolean);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'X-API-Key'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 hours
    preflightContinue: false
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options('*', cors(corsOptions));

// Security Middleware (Reverted to original)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // increase limit for development
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many attempts, please try again later.'
    }
});

// File upload middleware
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    abortOnLimit: true,
    parseNested: true,
    useTempFiles: false
}));

// Body parsers with increased limits
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({
    extended: true,
    limit: '50mb',
    parameterLimit: 100000
}));
app.use(cookieParser());

// Connect Database
connectDB();

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// -------------------- Base Route --------------------
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: ' Paplixo API is running...',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
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

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        cors: {
            origin: req.headers.origin,
            allowed: true
        }
    });
});

// -------------------- API Routes --------------------
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', publicRoutes);
app.use("/api/editor", editorRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments', billingRoutes); // NEW: Billing routes under payments

console.log("✅ Admin routes mounted at /api/admin");
console.log("✅ User routes mounted at /api/users");
console.log("✅ Newsletter routes mounted at /api/newsletter");
console.log("✅ Contact routes mounted at /api/contact");
console.log("✅ Public routes mounted at /api");
console.log("✅ Editor routes mounted at /api/editor");
console.log("✅ Pricing routes mounted at /api/pricing");
console.log("✅ Payment routes mounted at /api/payments");
console.log("✅ Billing routes mounted at /api/payments"); // NEW: Billing routes log

// -------------------- Error Handling --------------------
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);

    // CORS errors
    if (err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation',
            origin: req.headers.origin,
            error: process.env.NODE_ENV === 'development' ? err.message : {}
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// -------------------- 404 Handler --------------------
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: {
            admin: '/api/admin',
            users: '/api/users',
            newsletter: '/api/newsletter',
            contact: '/api/contact',
            public: '/api',
            editor: '/api/editor',
            pricing: '/api/pricing',
            payments: '/api/payments',
            // Billing endpoints
            billingHistory: '/api/payments/history',
            autoRenewalStatus: '/api/payments/auto-renewal/status',
            toggleAutoRenewal: '/api/payments/auto-renewal/toggle',
            // Specific user endpoints
            userLogin: '/api/users/login',
            userForgotPassword: '/api/users/forgot-password',
            userResetPassword: '/api/users/reset-password'
        }
    });
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    console.log(`🔗 Health check: http://${HOST}:${PORT}/api/health`);
    console.log(`📚 API Base: http://${HOST}:${PORT}/api`);
    console.log(`💰 Pricing API: http://${HOST}:${PORT}/api/pricing`);
    console.log(`💳 Payment API: http://${HOST}:${PORT}/api/payments`);
    console.log(`📊 Billing API: http://${HOST}:${PORT}/api/payments/history`);
    console.log(`✅ Available billing routes:`);
    console.log(`   - GET /api/payments/history`);
    console.log(`   - GET /api/payments/auto-renewal/status`);
    console.log(`   - POST /api/payments/auto-renewal/toggle`);
});