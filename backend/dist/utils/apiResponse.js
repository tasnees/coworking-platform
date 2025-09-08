"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
exports.sendResponse = sendResponse;
class ApiResponse {
    static success(res, data, message = 'Success', status = 200) {
        return res.status(status).json({
            status,
            message,
            data
        });
    }
    static error(res, message, status = 500, errors = null) {
        return res.status(status).json({
            status,
            message,
            errors
        });
    }
    static sendResponse(res, data, statusCode = 200, message = 'Success') {
        const response = {
            status: statusCode,
            message,
            data,
            success: statusCode >= 200 && statusCode < 300
        };
        return res.status(statusCode).json(response);
    }
    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404);
    }
    static unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401);
    }
    static forbidden(res, message = 'Forbidden') {
        return this.error(res, message, 403);
    }
    static badRequest(res, message = 'Bad Request', errors) {
        return this.error(res, message, 400, errors);
    }
    static internalError(res, message = 'Internal Server Error') {
        return this.error(res, message, 500);
    }
}
exports.ApiResponse = ApiResponse;
function sendResponse(res, data, statusCode = 200, message = 'Success') {
    const isSuccess = statusCode >= 200 && statusCode < 300;
    return res.status(statusCode).json({
        success: isSuccess,
        message,
        data
    });
}
