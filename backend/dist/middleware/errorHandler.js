"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error(error.stack);
    // Default error
    let status = 500;
    let message = 'Internal Server Error';
    // Handle specific error types
    if (error.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error';
    }
    else if (error.name === 'CastError') {
        status = 400;
        message = 'Invalid ID format';
    }
    else if (error.name === 'MongoError' && error.code === 11000) {
        status = 409;
        message = 'Duplicate key error';
    }
    res.status(status).json(Object.assign({ success: false, message }, (process.env.NODE_ENV === 'development' && { stack: error.stack })));
};
exports.errorHandler = errorHandler;
