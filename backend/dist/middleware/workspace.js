"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasWorkspacePermission = exports.isWorkspacePublic = exports.isWorkspaceOwner = exports.isWorkspaceAdmin = exports.isWorkspaceMember = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = require("../utils/logger");
const Workspace_1 = __importDefault(require("../models/Workspace"));
// Import ApiResponse and cast it properly
const apiResponse_1 = require("../utils/apiResponse");
const ApiResponse = apiResponse_1.ApiResponse;
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
        'view_analytics',
        'manage_amenities',
    ],
    member: [
        'view_workspace',
        'create_bookings',
        'view_amenities',
    ],
};
/**
 * Middleware to validate and attach workspace to request
 */
const attachWorkspace = async (req, res, next) => {
    try {
        const workspaceId = req.params.id;
        if (!workspaceId || !mongoose_1.Types.ObjectId.isValid(workspaceId)) {
            ApiResponse.unauthorized(res, 'Authentication required');
            return;
        }
        const workspaceData = await Workspace_1.default.findById(workspaceId)
            .populate('owner', '_id name email')
            .populate({
            path: 'members',
            populate: {
                path: 'user',
                select: '_id name email',
            },
        })
            .populate({
            path: 'staffMembers',
            populate: {
                path: 'user',
                select: '_id name email',
            },
        })
            .populate({
            path: 'admins',
            populate: {
                path: 'user',
                select: '_id name email',
            },
        })
            .lean();
        if (!workspaceData) {
            ApiResponse.notFound(res, 'Workspace not found');
            return;
        }
        // Build the roles map
        const roles = {};
        const workspace = workspaceData;
        // Map all member roles
        if (workspace.members) {
            workspace.members.forEach((member) => {
                if (member.user && typeof member.user === 'object' && '_id' in member.user) {
                    const userId = member.user._id.toString();
                    if (userId) {
                        roles[userId] = 'member';
                    }
                }
            });
        }
        // Map all staff roles
        if (workspace.staffMembers) {
            workspace.staffMembers.forEach((staff) => {
                if (staff.user && typeof staff.user === 'object' && '_id' in staff.user) {
                    const userId = staff.user._id.toString();
                    if (userId) {
                        roles[userId] = 'staff';
                    }
                }
            });
        }
        // Map all admin roles
        if (workspace.admins) {
            workspace.admins.forEach((admin) => {
                if (admin.user && typeof admin.user === 'object' && '_id' in admin.user) {
                    const userId = admin.user._id.toString();
                    if (userId) {
                        roles[userId] = 'admin';
                    }
                }
            });
        }
        // Map owner as admin
        if (workspace.owner && typeof workspace.owner === 'object' && '_id' in workspace.owner) {
            const ownerId = workspace.owner._id.toString();
            if (ownerId) {
                roles[ownerId] = 'admin';
            }
        }
        // Create workspace with roles
        const workspaceWithRoles = {
            ...workspace,
            roles,
            staffMembers: workspace.staffMembers || [],
            admins: workspace.admins || [],
            members: workspace.members || []
        };
        req.workspace = workspaceWithRoles;
        next();
    }
    catch (error) {
        logger_1.logger.error('Workspace validation error:', error);
        ApiResponse.internalError(res, 'Error validating workspace');
    }
};
/**
 * Middleware to check if user is a workspace member
 */
const isWorkspaceMember = async (req, res, next) => {
    try {
        if (!req.user) {
            ApiResponse.unauthorized(res, 'Authentication required');
            return;
        }
        await attachWorkspace(req, res, () => {
            const workspace = req.workspace;
            const userId = req.user?._id?.toString() || req.user?.id;
            if (!workspace) {
                ApiResponse.notFound(res, 'Workspace not found');
                return;
            }
            const isMember = workspace.members.some((member) => {
                if (typeof member.user === 'object' && '_id' in member.user) {
                    return member.user._id.toString() === userId;
                }
                return member.user.toString() === userId;
            });
            if (!isMember) {
                ApiResponse.forbidden(res, 'You must be a member of this workspace to perform this action.');
                return;
            }
            next();
        });
    }
    catch (error) {
        logger_1.logger.error('Workspace member check error:', error);
        ApiResponse.internalError(res, 'Error checking workspace membership');
    }
};
exports.isWorkspaceMember = isWorkspaceMember;
/**
 * Middleware to check if user is a workspace admin
 */
const isWorkspaceAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            ApiResponse.unauthorized(res, 'Authentication required');
            return;
        }
        await attachWorkspace(req, res, () => {
            const workspace = req.workspace;
            const userId = req.user?._id?.toString() || req.user?.id;
            if (!workspace) {
                ApiResponse.notFound(res, 'Workspace not found');
                return;
            }
            const isAdmin = workspace.admins.some((admin) => {
                if (typeof admin.user === 'object' && '_id' in admin.user) {
                    return admin.user._id.toString() === userId;
                }
                return admin.user.toString() === userId;
            });
            const isOwner = workspace.owner && typeof workspace.owner === 'object' && '_id' in workspace.owner
                ? workspace.owner._id.toString() === userId
                : workspace.owner?.toString() === userId;
            if (!isAdmin && !isOwner) {
                ApiResponse.forbidden(res, 'You must be an admin of this workspace to perform this action.');
                return;
            }
            next();
        });
    }
    catch (error) {
        logger_1.logger.error('Workspace admin check error:', error);
        ApiResponse.internalError(res, 'Error checking workspace admin status');
    }
};
exports.isWorkspaceAdmin = isWorkspaceAdmin;
/**
 * Middleware to check if user is the workspace owner
 */
const isWorkspaceOwner = async (req, res, next) => {
    try {
        if (!req.user) {
            ApiResponse.unauthorized(res, 'Authentication required');
            return;
        }
        await attachWorkspace(req, res, () => {
            const workspace = req.workspace;
            const userId = req.user?._id?.toString() || req.user?.id;
            if (!workspace) {
                ApiResponse.notFound(res, 'Workspace not found');
                return;
            }
            const isOwner = workspace.owner && typeof workspace.owner === 'object' && '_id' in workspace.owner
                ? workspace.owner._id.toString() === userId
                : workspace.owner?.toString() === userId;
            if (!isOwner) {
                ApiResponse.forbidden(res, 'You must be the owner of this workspace to perform this action.');
                return;
            }
            next();
        });
    }
    catch (error) {
        logger_1.logger.error('Workspace owner check error:', error);
        ApiResponse.internalError(res, 'Error checking workspace ownership');
    }
};
exports.isWorkspaceOwner = isWorkspaceOwner;
/**
 * Middleware to check if a workspace is public
 */
const isWorkspacePublic = async (req, res, next) => {
    try {
        await attachWorkspace(req, res, () => {
            const workspace = req.workspace;
            if (!workspace) {
                ApiResponse.notFound(res, 'Workspace not found');
                return;
            }
            if (!workspace.isPublic) {
                ApiResponse.forbidden(res, 'This workspace is not public.');
                return;
            }
            next();
        });
    }
    catch (error) {
        logger_1.logger.error('Workspace public check error:', error);
        ApiResponse.internalError(res, 'Error checking workspace visibility');
    }
};
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
    return async (req, res, next) => {
        try {
            if (!req.user || (!req.user._id && !req.user.id)) {
                ApiResponse.unauthorized(res, 'Authentication required');
                return;
            }
            await attachWorkspace(req, res, () => {
                const workspace = req.workspace;
                const userId = req.user?.id;
                if (!workspace) {
                    ApiResponse.notFound(res, 'Workspace not found');
                    return;
                }
                if (!userId) {
                    ApiResponse.unauthorized(res, 'Invalid user ID');
                    return;
                }
                const safeWorkspace = {
                    ...workspace,
                    roles: workspace.roles || {}
                };
                if (!hasPermission(safeWorkspace, userId, permission)) {
                    ApiResponse.forbidden(res, `You don't have permission to ${permission.replace(/_/g, ' ').toLowerCase()}`);
                    return;
                }
                next();
            });
        }
        catch (error) {
            logger_1.logger.error('Workspace permission check error:', error);
            ApiResponse.internalError(res, 'Error checking workspace permissions');
        }
    };
};
exports.hasWorkspacePermission = hasWorkspacePermission;
