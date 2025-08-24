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
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        // Run all validations
        yield Promise.all(validations.map(validation => validation.run(req)));
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        // Format errors
        const extractedErrors = [];
        const errorArray = errors.array({ onlyFirstError: false });
        for (const err of errorArray) {
            // Type guard for standard validation errors
            if (err && typeof err === 'object' && 'param' in err) {
                const param = typeof err.param === 'string' ? err.param : 'unknown';
                const msg = typeof err.msg === 'string' ? err.msg : 'Validation error';
                if (!extractedErrors.some(e => e.field === param)) {
                    extractedErrors.push({
                        field: param,
                        message: msg
                    });
                }
            }
            // Handle nested errors if they exist
            if ('nestedErrors' in err && Array.isArray(err.nestedErrors)) {
                const nestedErrors = err.nestedErrors || [];
                for (const nestedErr of nestedErrors) {
                    if (nestedErr && typeof nestedErr === 'object' && 'param' in nestedErr) {
                        const nestedParam = nestedErr.param || 'unknown';
                        const nestedMsg = nestedErr.msg || 'Validation error';
                        if (!extractedErrors.some(e => e.field === nestedParam)) {
                            extractedErrors.push({
                                field: nestedParam,
                                message: nestedMsg
                            });
                        }
                    }
                }
            }
        }
        logger_1.logger.warn('Validation failed:', {
            path: req.path,
            method: req.method,
            errors: extractedErrors
        });
        return res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            errors: extractedErrors
        });
    });
};
exports.validateRequest = validateRequest;
/**
 * Middleware to handle async/await errors in route handlers
 * @param fn The async route handler function
 * @returns A function that handles async errors
 */
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
