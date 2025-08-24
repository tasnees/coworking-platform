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
exports.isOwner = exports.hasRole = exports.isManager = exports.isAdmin = void 0;
const logger_1 = require("../utils/logger");
/**
 * Middleware to check if user has admin role
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        logger_1.logger.warn('Unauthorized access attempt - no user in request');
        return res.status(401).json({
            success: false,
            code: 'UNAUTHORIZED',
            message: 'Authentication required.'
        });
    }
    if (req.user.role !== 'admin') {
        logger_1.logger.warn(`Forbidden access attempt - user ${req.user._id} is not an admin`);
        return res.status(403).json({
            success: false,
            code: 'FORBIDDEN',
            message: 'Admin access required.'
        });
    }
    next();
};
exports.isAdmin = isAdmin;
/**
 * Middleware to check if user has manager role
 */
const isManager = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            code: 'UNAUTHORIZED',
            message: 'Authentication required.'
        });
    }
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            code: 'FORBIDDEN',
            message: 'Manager or admin access required.'
        });
    }
    next();
};
exports.isManager = isManager;
/**
 * Middleware to check if user has a specific role
 * @param roles Array of allowed roles
 */
const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required.'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: `Required roles: ${roles.join(', ')}`
            });
        }
        next();
    };
};
exports.hasRole = hasRole;
/**
 * Middleware to check if user is the owner of the resource
 * @param model Mongoose model to check ownership against
 * @param paramName Name of the URL parameter containing the resource ID
 * @param userField Field in the model that references the user (default: 'user')
 */
const isOwner = (model, paramName = 'id', userField = 'user') => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const resource = yield model.findById(req.params[paramName]);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    code: 'NOT_FOUND',
                    message: 'Resource not found.'
                });
            }
            // Check if the resource has the user field
            if (!resource[userField]) {
                return res.status(500).json({
                    success: false,
                    code: 'SERVER_ERROR',
                    message: 'Invalid resource structure.'
                });
            }
            // Check if user is the owner
            if (resource[userField].toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
                return res.status(403).json({
                    success: false,
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to access this resource.'
                });
            }
            // Attach the resource to the request for later use
            req.resource = resource;
            next();
        }
        catch (error) {
            logger_1.logger.error('Ownership check error:', error);
            return res.status(500).json({
                success: false,
                code: 'SERVER_ERROR',
                message: 'Error checking resource ownership.'
            });
        }
    });
};
exports.isOwner = isOwner;
