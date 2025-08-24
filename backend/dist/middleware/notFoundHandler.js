"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const logger_1 = require("../utils/logger");
/**
 * Middleware to handle 404 Not Found errors
 */
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    logger_1.logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'The requested resource was not found',
        error: {
            code: 'NOT_FOUND',
            details: `The route ${req.originalUrl} does not exist on this server`,
        },
        request: {
            method: req.method,
            path: req.path,
            timestamp: new Date().toISOString(),
        },
    });
};
exports.notFoundHandler = notFoundHandler;
