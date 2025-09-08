"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extendResponse = (_req, res, next) => {
    const response = res;
    // Initialize locals if not exists
    response.locals = response.locals || {};
    // Add success method
    response.success = function (data, message = 'Success') {
        const resp = {
            success: true,
            message,
            data
        };
        return this.status(200).json(resp);
    };
    // Add error method
    response.error = function (message, errors) {
        if (!message) {
            throw new Error('Error message is required');
        }
        // Get status code from the response, default to 400 if not set
        const statusCode = this.locals.statusCode || 400;
        const resp = {
            success: false,
            message,
            statusCode
        };
        if (errors) {
            resp.errors = errors;
        }
        return this.status(statusCode).json(resp);
    };
    // Helper methods for common HTTP errors
    response.notFound = function (message = 'Resource not found') {
        this.locals.statusCode = 404;
        return this.error(message);
    };
    response.unauthorized = function (message = 'Unauthorized') {
        this.locals.statusCode = 401;
        return this.error(message);
    };
    response.forbidden = function (message = 'Forbidden') {
        this.locals.statusCode = 403;
        return this.error(message);
    };
    response.badRequest = function (message = 'Bad request', errors) {
        this.locals.statusCode = 400;
        return this.error(message, errors);
    };
    response.internalError = function (message = 'Internal server error', errors) {
        this.locals.statusCode = 500;
        return this.error(message, errors);
    };
    next();
};
exports.default = extendResponse;
