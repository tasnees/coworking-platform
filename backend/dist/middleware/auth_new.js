"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authMiddleware = exports.AuthError = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
class AuthError extends Error {
    constructor(message, status = 401) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
    }
}
exports.AuthError = AuthError;
const authMiddleware = async (req, _res, next) => {
    try {
        // Get token from header or cookies
        let token;
        const authHeader = (req.headers.authorization || '');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && 'refreshToken' in req.cookies) {
            token = req.cookies.refreshToken;
        }
        if (!token) {
            throw new AuthError('Authentication required. No token provided.');
        }
        // Verify token
        const decoded = (0, jwt_1.verifyToken)(token, 'access');
        if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
            throw new AuthError('Invalid or expired token.');
        }
        // Get user from the token
        const user = await User_1.User.findById(decoded.userId).select('-password').exec();
        if (!user) {
            throw new AuthError('User not found.', 404);
        }
        // Check if user is active
        if (!user.isActive) {
            throw new AuthError('Account is deactivated.', 403);
        }
        // Attach user to request object
        const userObj = user.toObject();
        req.user = {
            ...userObj,
            id: user._id.toString(),
            role: user.role
        };
        req.token = token;
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        if (error instanceof Error) {
            next(error);
        }
        else {
            next(new Error('An unknown authentication error occurred'));
        }
    }
};
exports.authMiddleware = authMiddleware;
// Role-based middleware
const requireRoles = (roles) => {
    return (req, _res, next) => {
        void (async () => {
            if (!req.user) {
                throw new AuthError('Authentication required.');
            }
            const userRole = req.user.role;
            const allowedRoles = Array.isArray(roles) ? roles : [roles];
            if (!allowedRoles.includes(userRole)) {
                throw new AuthError('Insufficient permissions.', 403);
            }
            next();
        })();
    };
};
exports.requireRoles = requireRoles;
//# sourceMappingURL=auth_new.js.map