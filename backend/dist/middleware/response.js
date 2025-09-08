"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extendResponse = (_req, res, next) => {
    const customRes = res;
    // Add success method
    customRes.success = function (message = 'Success', data) {
        const response = {
            success: true,
            message
        };
        if (data !== undefined) {
            response.data = data;
        }
    };
    // Add error method
    customRes.error = function (message, statusCode = 400) {
        if (!message) {
            throw new Error('Error message is required');
        }
        const errorResponse = {
            success: false,
            message,
            statusCode
        };
    };
    // Add helper methods
    customRes.notFound = function (message = 'Resource not found') {
        this.error(message, 404);
    };
    customRes.unauthorized = function (message = 'Unauthorized') {
        this.error(message, 401);
    };
    customRes.forbidden = function (message = 'Forbidden') {
        this.error(message, 403);
    };
    customRes.badRequest = function (message = 'Bad Request') {
        this.error(message, 400);
    };
    customRes.internalError = function (message = 'Internal Server Error') {
        this.error(message, 500);
    };
    next();
};
exports.default = extendResponse;
