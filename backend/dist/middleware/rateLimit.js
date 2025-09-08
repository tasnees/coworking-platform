"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiting configuration
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => {
        // Ensure we always return a string, defaulting to 'unknown' if IP is not available
        return req.ip || 'unknown';
    },
    handler: (req, _res, next) => {
        const ip = req.ip || 'unknown';
        const error = new Error(`Rate limit exceeded for IP: ${ip}`);
        error.status = 429;
        next(error);
    },
});
exports.apiLimiter = apiLimiter;
// More aggressive rate limiting for authentication routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Ensure we always return a string, defaulting to 'unknown' if IP is not available
        return req.ip || 'unknown';
    },
    handler: (req, _res, next) => {
        const ip = req.ip || 'unknown';
        const error = new Error(`Too many login attempts from IP: ${ip}`);
        error.status = 429;
        next(error);
    },
});
exports.authLimiter = authLimiter;
