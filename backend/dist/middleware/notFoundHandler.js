"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
/**
 * Not found handler middleware
 * @param req - Express request object
 */
const notFoundHandler = (req) => {
    const errorDetails = {
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl
    };
    // Throw a 404 error that will be caught by the error handler
    const error = new ApiError_1.ApiError(404, `The requested resource ${req.path} was not found.`);
    // Add details to the error object
    Object.assign(error, { details: errorDetails });
    throw error;
};
exports.notFoundHandler = notFoundHandler;
