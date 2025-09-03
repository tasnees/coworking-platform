"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendResponse = void 0;
const extendResponse = (_req, res, next) => {
    // Add success method
    res.success = function (data, message = 'Success', status = 200) {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    };
    // Add error method
    res.error = function (message, status = 500, errors = null) {
        return res.status(status).json({
            success: false,
            message,
            errors: errors || undefined
        });
    };
    // Add helper methods
    res.notFound = function (message = 'Resource not found') {
        return this.error(message, 404);
    };
    res.unauthorized = function (message = 'Unauthorized') {
        return this.error(message, 401);
    };
    res.forbidden = function (message = 'Forbidden') {
        return this.error(message, 403);
    };
    res.badRequest = function (message = 'Bad Request', errors = null) {
        return this.error(message, 400, errors);
    };
    res.internalError = function (message = 'Internal Server Error', errors = null) {
        return this.error(message, 500, errors);
    };
    next();
};
exports.extendResponse = extendResponse;
exports.default = exports.extendResponse;
//# sourceMappingURL=response.js.map