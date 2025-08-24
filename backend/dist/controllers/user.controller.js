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
exports.deleteUser = exports.deactivateAccount = exports.updateUserRole = exports.updatePassword = exports.updateProfile = exports.getCurrentUser = exports.getUserById = exports.getAllUsers = void 0;
const logger_1 = require("../utils/logger");
const User_1 = __importDefault(require("../models/User"));
const email_1 = require("../utils/email");
/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        // Filtering
        const filter = {};
        if (req.query.role)
            filter.role = req.query.role;
        if (req.query.isActive)
            filter.isActive = req.query.isActive === 'true';
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        // Execute query with pagination
        const [users, total] = yield Promise.all([
            User_1.default.find(filter)
                .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User_1.default.countDocuments(filter)
        ]);
        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        res.status(200).json({
            success: true,
            count: users.length,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                hasNextPage,
                hasPreviousPage,
                nextPage: hasNextPage ? page + 1 : null,
                previousPage: hasPreviousPage ? page - 1 : null
            },
            data: users
        });
    }
    catch (error) {
        logger_1.logger.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error fetching users.'
        });
    }
});
exports.getAllUsers = getAllUsers;
/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id)
            .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger_1.logger.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error fetching user.'
        });
    }
});
exports.getUserById = getUserById;
/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)
            .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger_1.logger.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error fetching user profile.'
        });
    }
});
exports.getCurrentUser = getCurrentUser;
/**
 * @desc    Update user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email, phone, avatar, bio } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Check if email is being updated and if it's already taken
        if (email) {
            const existingUser = yield User_1.default.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    code: 'EMAIL_EXISTS',
                    message: 'Email already in use.'
                });
            }
        }
        const user = yield User_1.default.findByIdAndUpdate(userId, { name, email, phone, avatar, bio }, {
            new: true,
            runValidators: true
        }).select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }
        res.status(200).json({
            success: true,
            data: user,
            message: 'Profile updated successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error updating profile.'
        });
    }
});
exports.updateProfile = updateProfile;
/**
 * @desc    Update user password
 * @route   PUT /api/users/update-password
 * @access  Private
 */
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Find user with password
        const user = yield User_1.default.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }
        // Check current password
        const isMatch = yield user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Current password is incorrect.'
            });
        }
        // Update password
        user.password = newPassword;
        user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all existing tokens
        yield user.save();
        // Send password changed email
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: 'Password Changed',
            template: 'password-changed',
            context: {
                name: user.firstName || 'User'
            }
        });
        res.status(200).json({
            success: true,
            message: 'Password updated successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Update password error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error updating password.'
        });
    }
});
exports.updatePassword = updatePassword;
/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { role } = req.body;
        const userId = req.params.id;
        // Prevent modifying own role
        if (userId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(400).json({
                success: false,
                code: 'SELF_UPDATE',
                message: 'You cannot update your own role.'
            });
        }
        const user = yield User_1.default.findByIdAndUpdate(userId, { role }, {
            new: true,
            runValidators: true
        }).select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }
        res.status(200).json({
            success: true,
            data: user,
            message: 'User role updated successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error updating user role.'
        });
    }
});
exports.updateUserRole = updateUserRole;
/**
 * @desc    Deactivate user account
 * @route   PUT /api/users/deactivate
 * @access  Private
 */
const deactivateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { password } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Find user with password
        const user = yield User_1.default.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }
        // Verify password
        const isMatch = yield user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Password is incorrect.'
            });
        }
        // Deactivate account
        user.isActive = false;
        user.tokenVersion += 1; // Invalidate all existing tokens
        yield user.save();
        // Send account deactivated email
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: 'Account Deactivated',
            template: 'account-deactivated',
            context: {
                name: user.firstName || 'User'
            }
        });
        res.status(200).json({
            success: true,
            message: 'Your account has been deactivated.'
        });
    }
    catch (error) {
        logger_1.logger.error('Deactivate account error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error deactivating account.'
        });
    }
});
exports.deactivateAccount = deactivateAccount;
/**
 * @desc    Delete user account (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.params.id;
        // Prevent self-deletion
        if (userId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(400).json({
                success: false,
                code: 'SELF_DELETE',
                message: 'You cannot delete your own account.'
            });
        }
        const user = yield User_1.default.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }
        // TODO: Clean up user-related data (bookings, workspaces, etc.)
        res.status(200).json({
            success: true,
            data: {},
            message: 'User deleted successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error deleting user.'
        });
    }
});
exports.deleteUser = deleteUser;
