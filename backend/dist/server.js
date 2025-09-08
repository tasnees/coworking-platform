"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Import routes
const bookings_1 = __importDefault(require("./routes/bookings"));
const resources_1 = __importDefault(require("./routes/resources"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);
// Routes
app.use('/api/bookings', bookings_1.default);
app.use('/api/resources', resources_1.default);
app.use('/api/auth', auth_routes_1.default);
// Error handling middleware
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coworking-platform';
        const options = {
            // Connection timeout
            connectTimeoutMS: 10000,
            // Server selection timeout
            serverSelectionTimeoutMS: 5000,
            // Retry writes for better reliability
            retryWrites: true,
            // Write concern
            w: 'majority',
        };
        await mongoose_1.default.connect(mongoURI, options);
        logger_1.logger.info('MongoDB connected successfully');
    }
    catch (error) {
        logger_1.logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
// Start server
const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            logger_1.logger.info(`Server running on port ${PORT}`);
            logger_1.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger_1.logger.error('Unhandled Rejection! Shutting down...');
            logger_1.logger.error(`${err.name}: ${err.message}`);
            server.close(() => {
                process.exit(1);
            });
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
startServer().catch((error) => {
    logger_1.logger.error('Failed to start server:', error);
    process.exit(1);
});
exports.default = app;
