"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
/**
 * Error handling middleware that processes errors and throws them with additional context
 * @param err - The error object to handle
 */
const errorHandler = (err) => {
    console.error(err.stack);
    // Default error
    let status = 500;
    let message = 'Internal Server Error';
    let details = {};
    // Handle specific error types
    if (err instanceof ApiError_1.ApiError) {
        status = err.statusCode;
        message = err.message;
        // Include any additional details from the error object
        const errorWithDetails = err;
        if (errorWithDetails.details) {
            Object.assign(details, errorWithDetails.details);
        }
    }
    else if (err.name === 'ValidationError' && 'errors' in err) {
        status = 400;
        message = 'Validation Error';
        if (err.errors) {
            details = Object.entries(err.errors).reduce((acc, [key, value]) => {
                acc[key] = value.message;
                return acc;
            }, {});
        }
    }
    else if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid ID format';
    }
    else if (isMongoServerError(err) && err.code === 11000) {
        status = 409;
        message = 'Duplicate key error';
        if ('keyValue' in err) {
            details = { keyValue: err.keyValue };
        }
    }
    const response = {
        success: false,
        message,
        ...(Object.keys(details).length > 0 && { details }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    // Use a custom error handler function instead of direct response
    handleErrorResponse(status, response);
};
exports.errorHandler = errorHandler;
/**
 * Handles the error response
 * @param status - HTTP status code
 * @param response - Response object to send
 */
function handleErrorResponse(status, response) {
    // In a real application, you would handle the response here
    // For example, you could log it or send it to an error tracking service
    console.error(`Error ${status}:`, response);
    // If you need to send a response, you would typically do it through a framework-specific way
    // For example, in Express, you would use the response object
    // But since we're avoiding direct response handling, we'll just log it
    // In a real application, you might want to throw the error or handle it differently
    throw new Error(JSON.stringify({ status, ...response }));
}
// Type guard to check if error is a MongoServerError
function isMongoServerError(error) {
    return error instanceof Error && 'code' in error && 'keyValue' in error;
}
