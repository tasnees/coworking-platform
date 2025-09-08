"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const logger_1 = require("../utils/logger");
/**
 * Middleware to validate request using express-validator
 * @param validations Array of validation chains
 * @returns Middleware function
 */
const validateRequest = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        // Format errors
        const extractedErrors = [];
        const errorArray = errors.array({ onlyFirstError: false });
        const processError = (error) => {
            if (!error)
                return;
            const param = typeof error.param === 'string' ? error.param : 'unknown';
            const msg = typeof error.msg === 'string' ? error.msg : 'Validation error';
            if (!extractedErrors.some(e => e.field === param)) {
                extractedErrors.push({
                    field: param,
                    message: msg
                });
            }
            // Process nested errors
            if (Array.isArray(error.nestedErrors)) {
                error.nestedErrors.forEach(processError);
            }
        };
        errorArray.forEach(processError);
        logger_1.logger.warn('Validation failed:', {
            path: req.originalUrl || req.url,
            method: req.method,
            errors: extractedErrors
        });
        res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            errors: extractedErrors
        });
    };
};
exports.validateRequest = validateRequest;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// Also export as default
const exported = {
    validateRequest,
    asyncHandler
};
exports.default = exported;
