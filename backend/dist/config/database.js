"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
// Get MongoDB URI from environment variables or use default local development URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coworking-platform';
// Cache the connection to prevent multiple connections in development
let cachedConnection = null;
/**
 * Establishes a connection to MongoDB
 * @returns Promise that resolves to the Mongoose instance
 */
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info('Connecting to MongoDB...');
    // If we have a cached connection in development, return it
    if (cachedConnection) {
        logger_1.logger.info('Using cached database connection');
        return mongoose_1.default;
    }
    if (!MONGODB_URI) {
        const error = new Error('MONGODB_URI is not defined in environment variables');
        logger_1.logger.error(error.message);
        throw error;
    }
    const options = {
        serverSelectionTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 45000, // 45 seconds
        connectTimeoutMS: 30000, // 30 seconds
        maxPoolSize: 10, // Maximum number of connections in the connection pool
        minPoolSize: 1, // Minimum number of connections in the connection pool
        maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
        retryWrites: true,
        retryReads: true,
        heartbeatFrequencyMS: 10000, // Send a heartbeat every 10 seconds
    };
    try {
        logger_1.logger.info('Attempting to establish MongoDB connection...');
        const connection = yield mongoose_1.default.connect(MONGODB_URI, options);
        logger_1.logger.info('MongoDB connection established successfully');
        // Cache the connection
        cachedConnection = connection.connection;
        // Set up connection event handlers
        setupConnectionHandlers(connection.connection);
        return connection;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error(`Failed to connect to MongoDB: ${errorMessage}`);
        // Close any existing connections
        try {
            yield mongoose_1.default.connection.close(true);
        }
        catch (closeError) {
            logger_1.logger.error('Error closing MongoDB connection:', closeError);
        }
        throw error;
    }
});
exports.connectDB = connectDB;
/**
 * Sets up event handlers for MongoDB connection
 * @param connection - The MongoDB connection to set up handlers for
 */
function setupConnectionHandlers(connection) {
    // Connection events
    connection.on('connected', () => {
        logger_1.logger.info(`MongoDB connected to: ${connection.host}:${connection.port}/${connection.name}`);
    });
    connection.on('error', (error) => {
        logger_1.logger.error('MongoDB connection error:', error);
    });
    connection.on('disconnected', () => {
        logger_1.logger.warn('MongoDB disconnected');
        cachedConnection = null;
    });
    connection.on('reconnected', () => {
        logger_1.logger.info('MongoDB reconnected');
    });
    connection.on('reconnectFailed', () => {
        logger_1.logger.error('MongoDB reconnection failed');
        cachedConnection = null;
    });
    // Handle process termination
    process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info('Received SIGINT. Closing MongoDB connection...');
        try {
            yield mongoose_1.default.connection.close();
            logger_1.logger.info('MongoDB connection closed due to app termination');
            process.exit(0);
        }
        catch (closeError) {
            logger_1.logger.error('Error closing MongoDB connection:', closeError);
            process.exit(1);
        }
    }));
}
