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
exports.hasWorkspacePermission = exports.isWorkspacePublic = exports.isWorkspaceOwner = exports.isWorkspaceAdmin = exports.isWorkspaceMember = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = require("../utils/logger");
const Workspace_1 = require("../models/Workspace");
const WORKSPACE_PERMISSIONS = {
    admin: [
        'manage_members',
        'manage_staff',
        'manage_workspace',
        'delete_workspace',
        'view_analytics',
        'manage_bookings',
        'manage_amenities',
        'view_all',
    ],
    staff: [
        'manage_bookings',
        'view_members',
        'manage_amenities',
        'view_analytics',
        'view_all',
    ],
    member: [
        'view_workspace',
        'create_bookings',
        'view_amenities',
        'view_own',
    ],
};
/**
 * Middleware to validate and attach workspace to request
 * This is a base middleware that other workspace middlewares will use
 */
const attachWorkspace = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workspaceId = req.params.id;
        if (!workspaceId || !mongoose_1.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_WORKSPACE_ID',
                message: 'Invalid workspace ID provided.'
            });
        }
        const workspaceData = yield Workspace_1.WorkspaceModel.findById(workspaceId)
            .populate('owner', '_id name email')
            .populate({
            path: 'members',
            populate: {
                path: 'user',
                select: '_id name email'
            }
        })
            .populate({
            path: 'staffMembers',
            populate: {
                path: 'user',
                select: '_id name email'
            }
        })
            .populate({
            path: 'admins',
            populate: {
                path: 'user',
                select: '_id name email'
            }
        })
            .lean();
        if (!workspaceData) {
            return res.status(404).json({
                success: false,
                code: 'WORKSPACE_NOT_FOUND',
                message: 'Workspace not found.'
            });
        }
        // Build the roles map and ensure proper typing
        const roles = {};
        const workspace = workspaceData;
        // Map all member roles
        workspace.members.forEach((member) => {
            if (member.user._id) {
                roles[member.user._id.toString()] = 'member';
            }
        });
        // Map all staff roles
        workspace.staffMembers.forEach((staff) => {
            if (staff.user._id) {
                roles[staff.user._id.toString()] = 'staff';
            }
        });
        // Map all admin roles
        workspace.admins.forEach((admin) => {
            if (admin.user._id) {
                roles[admin.user._id.toString()] = 'admin';
            }
        });
        // Owner is always admin
        roles[workspace.owner._id.toString()] = 'admin';
        req.workspace = Object.assign(Object.assign({}, workspace), { roles });
        next();
    }
    catch (error) {
        logger_1.logger.error('Workspace validation error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error validating workspace.'
        });
    }
});
/**
 * Middleware to check if user is a workspace member
 */
const isWorkspaceMember = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required.'
            });
        }
        // First attach the workspace to the request
        yield attachWorkspace(req, res, () => __awaiter(void 0, void 0, void 0, function* () {
            const workspace = req.workspace;
            const userId = req.user.id;
            if (!workspace) {
                return res.status(404).json({
                    success: false,
                    code: 'WORKSPACE_NOT_FOUND',
                    message: 'Workspace not found.'
                });
            }
            const isMember = workspace.members.some((member) => member._id.toString() === userId);
            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    code: 'NOT_WORKSPACE_MEMBER',
                    message: 'You must be a member of this workspace to perform this action.'
                });
            }
            next();
        }));
    }
    catch (error) {
        logger_1.logger.error('Workspace member check error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error checking workspace membership.'
        });
    }
});
exports.isWorkspaceMember = isWorkspaceMember;
/**
 * Middleware to check if user is a workspace admin
 */
const isWorkspaceAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required.'
            });
        }
        // First attach the workspace to the request
        yield attachWorkspace(req, res, () => __awaiter(void 0, void 0, void 0, function* () {
            const workspace = req.workspace;
            const userId = req.user.id;
            if (!workspace) {
                return res.status(404).json({
                    success: false,
                    code: 'WORKSPACE_NOT_FOUND',
                    message: 'Workspace not found.'
                });
            }
            const isAdmin = workspace.admins.some((admin) => admin._id.toString() === userId);
            if (!isAdmin && workspace.owner._id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    code: 'NOT_WORKSPACE_ADMIN',
                    message: 'You must be an admin of this workspace to perform this action.'
                });
            }
            next();
        }));
    }
    catch (error) {
        logger_1.logger.error('Workspace admin check error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error checking workspace admin status.'
        });
    }
});
exports.isWorkspaceAdmin = isWorkspaceAdmin;
/**
 * Middleware to check if user is the workspace owner
 */
const isWorkspaceOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required.'
            });
        }
        // First attach the workspace to the request
        yield attachWorkspace(req, res, () => __awaiter(void 0, void 0, void 0, function* () {
            const workspace = req.workspace;
            const userId = req.user.id;
            if (!workspace) {
                return res.status(404).json({
                    success: false,
                    code: 'WORKSPACE_NOT_FOUND',
                    message: 'Workspace not found.'
                });
            }
            if (workspace.owner._id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    code: 'NOT_WORKSPACE_OWNER',
                    message: 'You must be the owner of this workspace to perform this action.'
                });
            }
            next();
        }));
    }
    catch (error) {
        logger_1.logger.error('Workspace owner check error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error checking workspace ownership.'
        });
    }
});
exports.isWorkspaceOwner = isWorkspaceOwner;
/**
 * Middleware to check if a workspace is public
 */
const isWorkspacePublic = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First attach the workspace to the request
        yield attachWorkspace(req, res, () => __awaiter(void 0, void 0, void 0, function* () {
            const workspace = req.workspace;
            if (!workspace) {
                return res.status(404).json({
                    success: false,
                    code: 'WORKSPACE_NOT_FOUND',
                    message: 'Workspace not found.'
                });
            }
            if (!workspace.isPublic) {
                return res.status(403).json({
                    success: false,
                    code: 'WORKSPACE_NOT_PUBLIC',
                    message: 'This workspace is not public.'
                });
            }
            next();
        }));
    }
    catch (error) {
        logger_1.logger.error('Workspace public check error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error checking workspace visibility.'
        });
    }
});
exports.isWorkspacePublic = isWorkspacePublic;
/**
 * Check if a user has a specific permission in the workspace
 */
const hasPermission = (workspace, userId, permission) => {
    if (!workspace || !userId)
        return false;
    const userRole = workspace.roles[userId];
    if (!userRole)
        return false;
    return WORKSPACE_PERMISSIONS[userRole].includes(permission);
};
/**
 * Middleware to check if user has specific permission
 */
const hasWorkspacePermission = (permission) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required.'
                });
            }
            yield attachWorkspace(req, res, () => {
                const workspace = req.workspace;
                const userId = req.user.id;
                if (!workspace) {
                    return res.status(404).json({
                        success: false,
                        code: 'WORKSPACE_NOT_FOUND',
                        message: 'Workspace not found.'
                    });
                }
                if (!hasPermission(workspace, userId, permission)) {
                    return res.status(403).json({
                        success: false,
                        code: 'PERMISSION_DENIED',
                        message: `You don't have permission to ${permission.replace(/_/g, ' ').toLowerCase()}`
                    });
                }
                next();
            });
        }
        catch (error) {
            logger_1.logger.error('Workspace permission check error:', error);
            return res.status(500).json({
                success: false,
                code: 'SERVER_ERROR',
                message: 'Error checking workspace permissions.'
            });
        }
    });
};
exports.hasWorkspacePermission = hasWorkspacePermission;
