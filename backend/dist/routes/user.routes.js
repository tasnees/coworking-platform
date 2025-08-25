"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const roles_1 = require("../middleware/roles");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware);
// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', user_controller_1.getCurrentUser);
// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', roles_1.isAdmin, user_controller_1.getAllUsers);
// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid user ID'),
], validateRequest_1.validateRequest, roles_1.isAdmin, user_controller_1.getUserById);
// @route   PUT /api/users/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', [
    (0, express_validator_1.body)('name').optional().not().isEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Please include a valid email'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Please include a valid phone number'),
], validateRequest_1.validateRequest, user_controller_1.updateProfile);
// @route   PUT /api/users/update-password
// @desc    Update current user's password
// @access  Private
router.put('/update-password', [
    (0, express_validator_1.body)('currentPassword').not().isEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
], validateRequest_1.validateRequest, user_controller_1.updatePassword);
// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put('/:id/role', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid user ID'),
    (0, express_validator_1.body)('role').isIn(['user', 'admin', 'manager']).withMessage('Invalid role'),
], validateRequest_1.validateRequest, roles_1.isAdmin, user_controller_1.updateUserRole);
// @route   PUT /api/users/deactivate
// @desc    Deactivate current user's account
// @access  Private
router.put('/deactivate', [
    (0, express_validator_1.body)('password').not().isEmpty().withMessage('Password is required for account deactivation'),
], validateRequest_1.validateRequest, user_controller_1.deactivateAccount);
// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid user ID'),
], validateRequest_1.validateRequest, roles_1.isAdmin, user_controller_1.deleteUser);
exports.default = router;
