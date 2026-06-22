// ============================================================
// EventFlow Backend - Main Server Entry Point
// ============================================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

// Import error handler middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ─── Security Middleware ────────────────────────────────────
app.use(helmet());

// Rate limiting - prevents brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

// ─── CORS Configuration ─────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://event-flow-dusky-xi.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

// ─── Body Parsing Middleware ────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Static Files (uploads) ─────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ─── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EventFlow API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ─── Error Handling ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Database Connection ────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventflow');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// ─── Auto-Seed Database ─────────────────────────────────────
const autoSeed = async () => {
  if (process.env.AUTO_SEED !== 'true') {
    console.log('⏭️  Auto-seed skipped (AUTO_SEED not enabled)');
    return;
  }

  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      console.log(`✅ Database already has ${userCount} users. Skipping seed.`);
      return;
    }

    console.log('🌱 Auto-seeding database...');
    const seedData = require('./utils/seeder');
    
    if (typeof seedData === 'function') {
      await seedData();
      console.log('✅ Auto-seed completed successfully!');
    } else {
      console.log('⚠️  Seeder not exported as function.');
      console.log('💡 Run manually: node utils/seeder.js');
    }
  } catch (error) {
    console.log('⚠️  Auto-seed failed:', error.message);
    console.log('💡 Run manually: node utils/seeder.js');
  }
};

// ─── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await autoSeed();
  
  app.listen(PORT, () => {
    console.log(`🚀 EventFlow API running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`✅ CORS enabled for:`, allowedOrigins.join(', '));
  });
};

startServer();

module.exports = app;