// Environment configuration
export const NODE_ENV = process.env.NODE_ENV || 'development';

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '300d';

// Database Configuration
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coworking-platform';

// Server Configuration
export const PORT = process.env.PORT || 5000;
export const HOST = process.env.HOST || '0.0.0.0';

// CORS Configuration
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX = 100; // limit each IP to 100 requests per windowMs
