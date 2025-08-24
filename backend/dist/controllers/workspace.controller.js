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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMemberRole = exports.removeMember = exports.addMember = exports.deleteWorkspace = exports.updateWorkspace = exports.getWorkspace = exports.getWorkspaces = exports.createWorkspace = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = require("../utils/logger");
const Workspace_1 = __importDefault(require("../models/Workspace"));
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
const email_1 = require("../utils/email");
/**
 * @desc    Create a new workspace
 * @route   POST /api/workspaces
 * @access  Private
 */
const createWorkspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description, type, capacity, amenities, location } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Create workspace
        const workspace = yield Workspace_1.default.create({
            name,
            description,
            type,
            capacity,
            amenities,
            location,
            owner: userId,
            admins: [userId],
            members: [userId]
        });
        // Add workspace to user's workspaces
        yield User_1.default.findByIdAndUpdate(userId, {
            $addToSet: { workspaces: workspace._id }
        });
        res.status(201).json({
            success: true,
            data: workspace,
            message: 'Workspace created successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Create workspace error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error creating workspace.'
        });
    }
});
exports.createWorkspace = createWorkspace;
/**
 * @desc    Get all workspaces
 * @route   GET /api/workspaces
 * @access  Private
 */
const getWorkspaces = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        // Filtering
        const filter = {};
        // Apply filters based on query params
        if (req.query.type)
            filter.type = req.query.type;
        if (req.query.capacity)
            filter.capacity = { $gte: parseInt(req.query.capacity, 10) };
        if (req.query.amenities) {
            filter.amenities = { $all: req.query.amenities.split(',') };
        }
        // Search
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { 'location.address': { $regex: req.query.search, $options: 'i' } }
            ];
        }
        // Execute query with pagination
        const [workspaces, total] = yield Promise.all([
            Workspace_1.default.find(filter)
                .populate('owner', 'name email')
                .populate('members', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Workspace_1.default.countDocuments(filter)
        ]);
        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        res.status(200).json({
            success: true,
            count: workspaces.length,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                hasNextPage,
                hasPreviousPage,
                nextPage: hasNextPage ? page + 1 : null,
                previousPage: hasPreviousPage ? page - 1 : null
            },
            data: workspaces
        });
    }
    catch (error) {
        logger_1.logger.error('Get workspaces error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error fetching workspaces.'
        });
    }
});
exports.getWorkspaces = getWorkspaces;
/**
 * @desc    Get single workspace by ID
 * @route   GET /api/workspaces/:id
 * @access  Private
 */
const getWorkspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workspace = yield Workspace_1.default.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('admins', 'name email')
            .populate('members', 'name email');
        if (!workspace) {
            return res.status(404).json({
                success: false,
                code: 'WORKSPACE_NOT_FOUND',
                message: 'Workspace not found.'
            });
        }
        res.status(200).json({
            success: true,
            data: workspace
        });
    }
    catch (error) {
        logger_1.logger.error('Get workspace error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error fetching workspace.'
        });
    }
});
exports.getWorkspace = getWorkspace;
/**
 * @desc    Update workspace
 * @route   PUT /api/workspaces/:id
 * @access  Private
 */
const updateWorkspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description, type, capacity, amenities, location, isActive } = req.body;
        const workspaceId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Check if workspace exists and user is admin/owner
        const workspace = yield Workspace_1.default.findOne({
            _id: workspaceId,
            $or: [
                { owner: userId },
                { admins: userId }
            ]
        });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                code: 'WORKSPACE_NOT_FOUND',
                message: 'Workspace not found or you do not have permission to update it.'
            });
        }
        // Update fields
        if (name)
            workspace.name = name;
        if (description)
            workspace.description = description;
        if (type)
            workspace.type = type;
        if (capacity)
            workspace.capacity = capacity;
        if (amenities)
            workspace.amenities = amenities;
        if (location)
            workspace.location = location;
        if (isActive !== undefined)
            workspace.isActive = isActive;
        yield workspace.save();
        res.status(200).json({
            success: true,
            data: workspace,
            message: 'Workspace updated successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Update workspace error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error updating workspace.'
        });
    }
});
exports.updateWorkspace = updateWorkspace;
/**
 * @desc    Delete workspace
 * @route   DELETE /api/workspaces/:id
 * @access  Private
 */
const deleteWorkspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const workspaceId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Check if workspace exists and user is owner
        const workspace = yield Workspace_1.default.findOne({
            _id: workspaceId,
            owner: userId
        });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                code: 'WORKSPACE_NOT_FOUND',
                message: 'Workspace not found or you do not have permission to delete it.'
            });
        }
        // TODO: Add cleanup for related data (bookings, resources, etc.)
        // Use deleteOne instead of remove
        yield Workspace_1.default.deleteOne({ _id: workspace._id });
        // Remove workspace from users' workspaces
        yield User_1.default.updateMany({ workspaces: workspace._id }, { $pull: { workspaces: workspace._id } });
        res.status(200).json({
            success: true,
            data: {},
            message: 'Workspace deleted successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete workspace error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error deleting workspace.'
        });
    }
});
exports.deleteWorkspace = deleteWorkspace;
/**
 * @desc    Add member to workspace
 * @route   POST /api/workspaces/:id/members
 * @access  Private
 */
const addMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId, role } = req.body;
        const workspaceId = req.params.id;
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Check if workspace exists and current user is admin/owner
        const workspace = yield Workspace_1.default.findOne({
            _id: workspaceId,
            $or: [
                { owner: currentUserId },
                { admins: currentUserId }
            ]
        });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                code: 'WORKSPACE_NOT_FOUND',
                message: 'Workspace not found or you do not have permission to add members.'
            });
        }
        // Check if user exists
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }
        // Check if user is already a member
        if (workspace.members.some(memberId => memberId.toString() === userId)) {
            return res.status(400).json({
                success: false,
                code: 'MEMBER_EXISTS',
                message: 'User is already a member of this workspace.'
            });
        }
        // Add user to workspace
        workspace.members.push(userId);
        if (role === 'admin') {
            workspace.admins.push(userId);
        }
        yield workspace.save();
        // Add workspace to user's workspaces
        yield User_1.default.findByIdAndUpdate(userId, {
            $addToSet: { workspaces: workspaceId }
        });
        // Send invitation email
        const invitationUrl = `${process.env.CLIENT_URL}/workspaces/${workspaceId}`;
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: `You've been added to ${workspace.name}`,
            template: 'workspace-invitation',
            context: {
                name: user.firstName || 'User',
                workspaceName: workspace.name,
                inviterName: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.firstName) || 'A user',
                invitationUrl
            }
        });
        res.status(200).json({
            success: true,
            data: workspace,
            message: 'Member added successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Add member error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error adding member to workspace.'
        });
    }
});
exports.addMember = addMember;
/**
 * @desc    Remove member from workspace
 * @route   DELETE /api/workspaces/:id/members/:userId
 * @access  Private
 */
const removeMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.params;
        const workspaceId = req.params.id;
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'User not authenticated.'
            });
        }
        // Check if workspace exists and current user is admin/owner
        const workspace = yield Workspace_1.default.findOne({
            _id: workspaceId,
            $or: [
                { owner: currentUserId },
                { admins: currentUserId }
            ]
        });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                code: 'WORKSPACE_NOT_FOUND',
                message: 'Workspace not found or you do not have permission to remove members.'
            });
        }
        // Prevent removing the owner
        if (workspace.owner.toString() === userId) {
            return res.status(400).json({
                success: false,
                code: 'OWNER_REMOVAL',
                message: 'Cannot remove the workspace owner.'
            });
        }
        // Check if user is a member
        if (!workspace.members.some((memberId) => memberId.toString() === userId)) {
            return res.status(400).json({
                success: false,
                code: 'NOT_A_MEMBER',
                message: 'User is not a member of this workspace.'
            });
        }
        // Remove user from workspace
        workspace.members = workspace.members.filter((memberId) => memberId.toString() !== userId);
        workspace.admins = workspace.admins.filter((adminId) => adminId.toString() !== userId);
        yield workspace.save();
        // Remove workspace from user's workspaces
        yield User_1.default.findByIdAndUpdate(userId, {
            $pull: { workspaces: workspaceId }
        });
        // Cancel user's upcoming bookings for this workspace
        const bookings = yield Booking_1.default.find({
            workspace: workspaceId,
            user: userId,
            startDate: { $gt: new Date() }
        });
        yield Promise.all(bookings.map((booking) => booking.remove()));
        res.status(200).json({
            success: true,
            data: {},
            message: 'Member removed successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Remove member error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error removing member from workspace.'
        });
    }
});
exports.removeMember = removeMember;
/**
 * @desc    Update member role
 * @route   PUT /api/workspaces/:id/members/:userId/role
 * @access  Private
 */
/**
 * @desc    Update member role
 * @route   PUT /api/workspaces/:id/members/:userId/role
 * @access  Private
 */
const updateMemberRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const workspaceId = req.params.id;
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'User not authenticated.'
            });
        }
        // Check if workspace exists and current user is admin/owner
        const workspace = yield Workspace_1.default.findOne({
            _id: workspaceId,
            $or: [
                { owner: currentUserId },
                { admins: currentUserId }
            ]
        });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                code: 'WORKSPACE_NOT_FOUND',
                message: 'Workspace not found or you do not have permission to update roles.'
            });
        }
        // Prevent modifying owner's role
        if (workspace.owner.toString() === userId) {
            return res.status(400).json({
                success: false,
                code: 'OWNER_ROLE',
                message: 'Cannot change the role of the workspace owner.'
            });
        }
        // Check if user is a member
        if (!workspace.members.some((memberId) => memberId.toString() === userId)) {
            return res.status(400).json({
                success: false,
                code: 'NOT_A_MEMBER',
                message: 'User is not a member of this workspace.'
            });
        }
        // Update role
        if (role === 'admin') {
            // Add to admins if not already
            if (!workspace.admins.some((adminId) => adminId.toString() === userId)) {
                workspace.admins.push(new mongoose_1.Types.ObjectId(userId));
            }
        }
        else {
            // Remove from admins if role is not admin
            workspace.admins = workspace.admins.filter((adminId) => adminId.toString() !== userId);
        }
        yield workspace.save();
        res.status(200).json({
            success: true,
            data: workspace,
            message: 'Member role updated successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Update member role error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error updating member role.'
        });
    }
});
exports.updateMemberRole = updateMemberRole;
