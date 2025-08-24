"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const auth_1 = require("../middleware/auth");
const workspace_controller_1 = require("../controllers/workspace.controller");
const workspace_1 = require("../middleware/workspace");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.auth);
// @route   POST /api/workspaces
// @desc    Create a new workspace
// @access  Private
router.post('/', [
    (0, express_validator_1.body)('name').trim().not().isEmpty().withMessage('Workspace name is required'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('type').isIn(['open', 'private']).withMessage('Invalid workspace type'),
    (0, express_validator_1.body)('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    (0, express_validator_1.body)('amenities').optional().isArray().withMessage('Amenities must be an array'),
    (0, express_validator_1.body)('location').optional().trim(),
], validateRequest_1.validateRequest, workspace_controller_1.createWorkspace);
// @route   GET /api/workspaces
// @desc    Get all workspaces (with optional filtering)
// @access  Private
router.get('/', [
    (0, express_validator_1.query)('type').optional().isIn(['all', 'my', 'public']).withMessage('Invalid filter type'),
    (0, express_validator_1.query)('search').optional().trim(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], validateRequest_1.validateRequest, workspace_controller_1.listWorkspaces);
// @route   GET /api/workspaces/:id
// @desc    Get workspace by ID
// @access  Private
router.get('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid workspace ID'),
], validateRequest_1.validateRequest, workspace_1.isWorkspaceMember, workspace_controller_1.getWorkspace);
// @route   PUT /api/workspaces/:id
// @desc    Update workspace
// @access  Private/Workspace Admin
router.put('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid workspace ID'),
    (0, express_validator_1.body)('name').optional().trim().not().isEmpty().withMessage('Name cannot be empty'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('type').optional().isIn(['open', 'private']).withMessage('Invalid workspace type'),
    (0, express_validator_1.body)('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    (0, express_validator_1.body)('amenities').optional().isArray().withMessage('Amenities must be an array'),
    (0, express_validator_1.body)('location').optional().trim(),
], validateRequest_1.validateRequest, workspace_1.isWorkspaceAdmin, workspace_controller_1.updateWorkspace);
// @route   DELETE /api/workspaces/:id
// @desc    Delete workspace
// @access  Private/Workspace Admin
router.delete('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid workspace ID'),
], validateRequest_1.validateRequest, workspace_1.isWorkspaceAdmin, workspace_controller_1.deleteWorkspace);
// @route   GET /api/workspaces/:id/members
// @desc    Get workspace members
// @access  Private/Workspace Member
router.get('/:id/members', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid workspace ID'),
], validateRequest_1.validateRequest, workspace_1.isWorkspaceMember, workspace_controller_1.getWorkspaceMembers);
// @route   POST /api/workspaces/:id/members
// @desc    Add member to workspace
// @access  Private/Workspace Admin
router.post('/:id/members', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid workspace ID'),
    (0, express_validator_1.body)('userId').isMongoId().withMessage('Invalid user ID'),
    (0, express_validator_1.body)('role').isIn(['member', 'admin']).withMessage('Invalid role'),
], validateRequest_1.validateRequest, workspace_1.isWorkspaceAdmin, workspace_controller_1.addWorkspaceMember);
// @route   PUT /api/workspaces/:id/members/:userId/role
// @desc    Update member role
// @access  Private/Workspace Admin
router.put('/:id/members/:userId/role', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid workspace ID'),
    (0, express_validator_1.param)('userId').isMongoId().withMessage('Invalid user ID'),
    (0, express_validator_1.body)('role').isIn(['member', 'admin']).withMessage('Invalid role'),
], validateRequest_1.validateRequest, workspace_1.isWorkspaceAdmin, workspace_controller_1.updateMemberRole);
// @route   DELETE /api/workspaces/:id/members/:userId
// @desc    Remove member from workspace
// @access  Private/Workspace Admin
router.delete('/:id/members/:userId', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid workspace ID'),
    (0, express_validator_1.param)('userId').isMongoId().withMessage('Invalid user ID'),
], validateRequest_1.validateRequest, workspace_1.isWorkspaceAdmin, workspace_controller_1.removeWorkspaceMember);
// @route   POST /api/workspaces/:id/join
// @desc    Join a public workspace
// @access  Private
router.post('/:id/join', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid workspace ID'),
], validateRequest_1.validateRequest, workspace_controller_1.joinWorkspace);
// @route   POST /api/workspaces/:id/leave
// @desc    Leave a workspace
// @access  Private/Workspace Member
router.post('/:id/leave', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid workspace ID'),
], validateRequest_1.validateRequest, workspace_1.isWorkspaceMember, workspace_controller_1.leaveWorkspace);
exports.default = router;
