"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_MAX = exports.RATE_LIMIT_WINDOW_MS = exports.CORS_ORIGIN = exports.HOST = exports.PORT = exports.MONGODB_URI = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.NODE_ENV = void 0;
// Environment configuration
exports.NODE_ENV = process.env.NODE_ENV || 'development';
// JWT Configuration
exports.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
// Database Configuration
exports.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coworking-platform';
// Server Configuration
exports.PORT = process.env.PORT || 5000;
exports.HOST = process.env.HOST || '0.0.0.0';
// CORS Configuration
exports.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
// Rate Limiting
exports.RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
exports.RATE_LIMIT_MAX = 100; // limit each IP to 100 requests per windowMs
