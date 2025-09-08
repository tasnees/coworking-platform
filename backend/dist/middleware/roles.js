"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwner = exports.isStaff = exports.isAdmin = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = require("../utils/logger");
// Role check helper function with proper typing
const checkRole = (requiredRole) => {
    return (req, _res, next) => {
        if (req.user?.role === requiredRole) {
            next();
            return;
        }
        logger_1.logger.warn(`Unauthorized access attempt: not ${requiredRole}`);
        const error = new Error(`Forbidden: ${requiredRole} role required`);
        error.name = 'ForbiddenError';
        next(error);
    };
};
// Role-based middleware
exports.isAdmin = checkRole('admin');
exports.isStaff = checkRole('staff');
// Ownership middleware with proper typing
const isOwner = (model, paramName = 'id', userField = 'user') => {
    return async (req, _res, next) => {
        try {
            const resourceId = req.params[paramName];
            if (!resourceId) {
                throw new Error('Missing resource ID');
            }
            const resource = await model.findById(resourceId).exec();
            if (!resource) {
                throw new Error('Resource not found');
            }
            const resourceUser = resource.get(userField);
            let resourceUserId;
            if (!resourceUser) {
                throw new Error('Resource user not found');
            }
            if (typeof resourceUser === 'string') {
                resourceUserId = resourceUser;
            }
            else if (resourceUser && typeof resourceUser === 'object' && '_id' in resourceUser) {
                const id = resourceUser._id;
                resourceUserId = id instanceof mongoose_1.Types.ObjectId ? id.toString() : String(id);
            }
            else if (resourceUser && typeof resourceUser.toString === 'function') {
                const idStr = resourceUser.toString();
                if (mongoose_1.Types.ObjectId.isValid(idStr)) {
                    resourceUserId = idStr;
                }
            }
            const userId = req.user?._id;
            const userIdString = userId && typeof userId !== 'string' ? userId.toString() : userId;
            if (!resourceUserId || !userIdString || resourceUserId !== userIdString) {
                logger_1.logger.warn('Unauthorized access attempt: not owner');
                throw new Error('Unauthorized: Not the owner');
            }
            req.resource = resource;
            next();
        }
        catch (err) {
            const error = err;
            logger_1.logger.error('Error in ownership check', { error: error.message });
            next(error);
        }
    };
};
exports.isOwner = isOwner;
