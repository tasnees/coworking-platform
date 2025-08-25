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
exports.updateMemberRole = exports.removeMember = exports.addMember = exports.getWorkspaceMembers = exports.deleteWorkspace = exports.updateWorkspace = exports.getWorkspace = exports.getWorkspaces = exports.createWorkspace = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = require("../utils/logger");
const Workspace_1 = require("../models/Workspace");
const User_1 = require("../models/User");
const Booking_1 = __importDefault(require("../models/Booking"));
const email_1 = require("../utils/email");
/**
 * @desc    Create a workspace
 * @route   POST /api/workspaces
 * @access  Private
 */
const createWorkspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description, type, capacity, amenities, location } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Create a new workspace
        const workspace = new Workspace_1.WorkspaceModel({
            name,
            description,
            type,
            capacity,
            amenities,
            location,
            owner: userId
        });
        yield workspace.save();
        // Add workspace to user's workspaces
        if (userId) {
            yield User_1.User.findByIdAndUpdate(userId, {
                $addToSet: { workspaces: workspace._id }
            });
        }
        return res.status(201).json({
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
 * @desc    Get workspaces
 * @route   GET /api/workspaces
 * @access  Private
 */
const getWorkspaces = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        // Filtering
        const filter = {};
        // Apply filters based on query params
        if (req.query.type)
            filter.type = req.query.type;
        if (req.query.capacity) {
            const capacityValue = parseInt(req.query.capacity, 10);
            if (!isNaN(capacityValue)) {
                filter.capacity = { $gte: capacityValue };
            }
        }
        if (req.query.amenities) {
            const amenitiesList = req.query.amenities.split(',').filter(Boolean);
            if (amenitiesList.length > 0) {
                filter.amenities = { $all: amenitiesList };
            }
        }
        // Search
        if (req.query.search) {
            const searchQuery = req.query.search;
            filter.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { 'location.address': { $regex: searchQuery, $options: 'i' } }
            ];
        }
        // Execute query with pagination
        const [workspaces, total] = yield Promise.all([
            Workspace_1.WorkspaceModel.find(filter)
                .populate('owner', 'name email')
                .populate('members', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Workspace_1.WorkspaceModel.countDocuments(filter)
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
        const workspaceId = req.params.id;
        const workspace = yield Workspace_1.WorkspaceModel.findById(workspaceId)
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
        // Input validation
        if (!userId) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'User not authenticated.'
            });
        }
        // Check if workspace exists and user is admin/owner
        const workspace = yield Workspace_1.WorkspaceModel.findOne({
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
        // Prepare update data
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        if (type)
            updateData.type = type;
        if (typeof capacity === 'number' && capacity > 0)
            updateData.capacity = capacity;
        if (typeof isActive === 'boolean')
            updateData.isActive = isActive;
        if (location && location.address)
            updateData.location = location;
        // Handle amenities safely - merge existing with new ones if provided
        if (Array.isArray(amenities)) {
            updateData.amenities = [...new Set([...(workspace.get('amenities') || []), ...amenities])];
        }
        // Update the workspace
        const updatedWorkspace = yield Workspace_1.WorkspaceModel.findByIdAndUpdate(workspaceId, { $set: updateData }, { new: true, runValidators: true })
            .populate('owner', 'name email')
            .populate('admins', 'name email')
            .populate('members', 'name email');
        if (!updatedWorkspace) {
            return res.status(404).json({
                success: false,
                code: 'UPDATE_FAILED',
                message: 'Failed to update workspace.'
            });
        }
        return res.status(200).json({
            success: true,
            data: updatedWorkspace,
            message: 'Workspace updated successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Update workspace error:', error);
        return res.status(500).json({
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
        const workspace = yield Workspace_1.WorkspaceModel.findOne({
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
        yield Workspace_1.WorkspaceModel.deleteOne({ _id: workspace._id });
        // Remove workspace from users' workspaces
        yield User_1.User.updateMany({ workspaces: workspace._id }, { $pull: { workspaces: workspace._id } });
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
const getWorkspaceMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const workspace = yield Workspace_1.WorkspaceModel.findById(id)
            .populate('members.user', 'name email avatar role')
            .populate('members.invitedBy', 'name email');
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }
        // Check if user has permission to view members
        // (optional - your isWorkspaceMember middleware might handle this)
        res.status(200).json({
            success: true,
            data: {
                members: workspace.members,
                totalMembers: workspace.members.length
            }
        });
    }
    catch (error) {
        console.error('Get workspace members error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving workspace members'
        });
    }
});
exports.getWorkspaceMembers = getWorkspaceMembers;
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
        const workspace = yield Workspace_1.WorkspaceModel.findOne({
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
        const user = yield User_1.User.findById(userId);
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
        yield User_1.User.findByIdAndUpdate(userId, {
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
        const workspace = yield Workspace_1.WorkspaceModel.findOne({
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
        yield User_1.User.findByIdAndUpdate(userId, {
            $pull: { workspaces: workspaceId }
        });
        // Cancel user's upcoming bookings for this workspace
        const bookings = yield Booking_1.default.find({
            workspace: workspaceId,
            user: userId,
            startDate: { $gt: new Date() }
        });
        yield Promise.all(bookings.map((booking) => Booking_1.default.findByIdAndDelete(booking._id)));
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
        const workspace = yield Workspace_1.WorkspaceModel.findOne({
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
