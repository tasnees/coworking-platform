"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authMiddleware = void 0;
/* eslint-disable @typescript-eslint/no-namespace */
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
const ApiError_1 = require("../utils/ApiError");
const authMiddleware = async (req, _res, next) => {
    try {
        // Get token from header or cookies
        let token;
        const authHeader = (req.headers.authorization || req.headers.Authorization);
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies?.refreshToken) {
            token = req.cookies.refreshToken;
        }
        if (!token) {
            throw new ApiError_1.ApiError(401, 'Authentication required. No token provided.');
        }
        // Verify token
        const decoded = (0, jwt_1.verifyToken)(token, 'access');
        if (!decoded) {
            throw new ApiError_1.ApiError(401, 'Invalid or expired token.');
        }
        // Get user from the token
        const user = await User_1.User.findById(decoded.userId).select('-password').lean();
        if (!user) {
            throw new ApiError_1.ApiError(401, 'User not found.');
        }
        // Check if user is active
        if (!user.isActive) {
            throw new ApiError_1.ApiError(403, 'Account is deactivated.');
        }
        // Attach user and token to request object
        const { _id, role, ...userData } = user;
        req.user = {
            id: _id.toString(),
            role: role,
            ...userData
        };
        req.token = token;
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        throw new ApiError_1.ApiError(401, 'Authentication failed.');
    }
};
exports.authMiddleware = authMiddleware;
// Role-based middleware
const requireRoles = (roles) => {
    return (req, _res, next) => {
        if (!req.user || !req.user.role) {
            throw new ApiError_1.ApiError(401, 'Authentication required.');
        }
        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(userRole)) {
            throw new ApiError_1.ApiError(403, 'Insufficient permissions.');
        }
        next();
    };
};
exports.requireRoles = requireRoles;
