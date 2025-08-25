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
exports.deleteUser = exports.deactivateAccount = exports.updateUserRole = exports.updatePassword = exports.updateProfile = exports.getCurrentUser = exports.getUserById = exports.getAllUsers = void 0;
const mongoose_1 = require("mongoose");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const email_1 = require("../utils/email");
/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        const page = typeof query.page === 'string' ? parseInt(query.page, 10) : 1;
        const limit = typeof query.limit === 'string' ? parseInt(query.limit, 10) : 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.role)
            filter.role = query.role;
        if (query.isActive)
            filter.isActive = query.isActive === 'true';
        if (query.search) {
            const searchRegex = new RegExp(query.search, 'i');
            filter.$or = [
                { name: { $regex: searchRegex, $options: 'i' } },
                { email: { $regex: searchRegex, $options: 'i' } }
            ];
        }
        const [users, totalRaw] = yield Promise.all([
            User_1.User.find(filter)
                .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            User_1.User.countDocuments(filter).exec()
        ]); // Explicit typing
        const total = +totalRaw;
        return res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get all users error:', error);
        return res.status(parseInt('500', 10)).json({
            success: false,
            error: 'Server Error'
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
        const { id } = req.params;
        if (!id || !mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }
        const user = yield User_1.User.findById(id)
            .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
            .lean()
            .exec();
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger_1.logger.error('Get user by ID error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
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
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }
        const user = yield User_1.User.findById(userId)
            .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
            .lean()
            .exec();
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger_1.logger.error('Get current user error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
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
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }
        const { name, email } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        const user = yield User_1.User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
            .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
            .lean()
            .exec();
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger_1.logger.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});
exports.updateProfile = updateProfile;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current and new password are required'
            });
        }
        const user = yield User_1.User.findById(userId).select('+password').exec();
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const isMatch = yield user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }
        user.password = newPassword;
        yield user.save();
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: 'Password Updated',
            template: 'password-updated',
            context: { name: typeof user.name === 'string' ? user.name : 'User' }
        });
        return res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update password error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
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
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update roles'
            });
        }
        const { id } = req.params;
        const { role } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }
        if (!['user', 'admin', 'manager'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be user, admin, or manager'
            });
        }
        const user = yield User_1.User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true })
            .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
            .lean()
            .exec();
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger_1.logger.error('Update user role error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});
exports.updateUserRole = updateUserRole;
/**
 * @desc    Deactivate user account
 * @route   PUT /api/users/me/deactivate or /api/users/:id/deactivate
 * @access  Private
 */
const deactivateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const userId = req.params.id || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!userId || !(0, mongoose_1.isValidObjectId)(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin' && userId !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }
        const user = yield User_1.User.findByIdAndUpdate(userId, { isActive: false }, { new: true })
            .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
            .lean()
            .exec();
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        yield (0, email_1.sendEmail)({
            to: (_d = user.email) !== null && _d !== void 0 ? _d : '',
            subject: 'Account Deactivated',
            template: 'account-deactivated',
            context: { name: (_e = user.name) !== null && _e !== void 0 ? _e : 'User' }
        });
        return res.status(200).json({
            success: true,
            message: 'Account deactivated'
        });
    }
    catch (error) {
        logger_1.logger.error('Deactivate account error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
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
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }
        const user = yield User_1.User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'User deleted'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete user error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});
exports.deleteUser = deleteUser;
