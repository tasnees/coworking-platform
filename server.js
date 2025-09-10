require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Database connection with retry logic
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  const isAtlas = process.env.MONGODB_URI.includes('mongodb+srv');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔌 Attempting to connect to MongoDB (attempt ${i + 1}/${maxRetries})...`);
      
      const mongoOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 5, // Reduced for Render's free tier
        minPoolSize: 0, // Allow connection pool to empty when not in use
        maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
        connectTimeoutMS: 10000, // 10 seconds to establish initial connection
        heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
        retryWrites: true,
        retryReads: true,
        maxConnecting: 5, // Maximum number of simultaneous connection attempts
        tls: isAtlas, // Enable TLS for Atlas connections
        tlsAllowInvalidCertificates: false, // Strict certificate validation
        compressors: ['zstd', 'snappy', 'zlib'], // Compression algorithms
        zlibCompressionLevel: 7, // Compression level (1-9)
        w: 'majority'
      };

      // For MongoDB Atlas (which uses SSL), we don't need to set ssl options explicitly
      if (process.env.MONGODB_URI.includes('mongodb+srv')) {
        mongoOptions.ssl = true;
      }

      await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
      
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection error (attempt ${i + 1}/${maxRetries}):`, err.message);
      
      if (i === maxRetries - 1) {
        console.error('❌ Failed to connect to MongoDB after maximum retries');
        process.exit(1);
      }
      
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} signal received: closing MongoDB connection`);
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB disconnection:', err);
    process.exit(1);
  }
};

// Configure request logging
const logFormat = isProduction ? 'combined' : 'dev';
const logStream = isProduction
  ? rfs.createStream('access.log', {
      interval: '1d',
      path: path.join(__dirname, 'logs')
    })
  : process.stdout;

// Configure middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10kb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(xss()); // Sanitize data against XSS
app.use(hpp()); // Protect against HTTP Parameter Pollution
app.use(compression()); // Compress responses

// Logging middleware
app.use(morgan(logFormat, { stream: logStream }));

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // In production, we use the standalone output
    if (isProduction) {
      // Serve static files from .next/static
      app.use(
        '/_next/static',
        express.static(path.join(__dirname, '.next/static'), {
          maxAge: '1y',
          immutable: true,
        })
      );
      
      // Serve other static files
      app.use(express.static(path.join(__dirname, 'public'), {
        maxAge: '1y',
        immutable: true
      }));
      
      // Handle Next.js page requests
      app.get('*', (req, res) => handle(req, res));
    } else {
      // In development, let Next.js handle everything
      await nextApp.prepare();
      app.get('*', (req, res) => handle(req, res));
    }
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('❌ Server Error:', err);
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
      });
    });
    
    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        status: 'error',
        message: 'Not Found'
      });
    });
    
    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Open: http://localhost:${PORT}`);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('🔥 Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('💥 Uncaught Exception:', err);
      server.close(() => process.exit(1));
    });
    
    // Handle SIGTERM for graceful shutdown
    process.on('SIGTERM', () => {
      console.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
      });
    });
    
    return server;
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer().catch(err => {
    console.error('Fatal error during startup:', err);
    process.exit(1);
  });
}

module.exports = app;

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent parameter pollution
app.use(compression()); // Compress responses

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// Logging
const logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
  path: logDirectory,
});
app.use(isProduction ? morgan('combined', { stream: accessLogStream }) : morgan('dev'));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cors(corsOptions));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// User Schema and Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'staff', 'member'], default: 'member' },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, select: false },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
userSchema.index({ email: 1 });

// Document middleware to hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    // Input validation
    if (!email || !password || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email, password, and name',
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists',
      });
    }
    
    const user = await User.create({
      email,
      password,
      name,
    });
    
    // Remove password from output
    user.password = undefined;
    
    // Create token without expiration
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
      // No expiration set
    );
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }
    
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
      });
    }
    
    // 3) If everything ok, send token to client
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
      // No expiration set
    );
    
    // Remove password from output
    user.password = undefined;
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Protect routes middleware
const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in! Please log in to get access.',
      });
    }

    // 2) Verification token - ignore expiration if present
    const decoded = await jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true // Skip expiration check
    });

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

// Example protected route
app.get('/api/users/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '.next', 'static')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '.next', 'server', 'pages', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});
