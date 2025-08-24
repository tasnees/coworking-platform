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
exports.updatePassword = exports.updateDetails = exports.getMe = exports.resetPassword = exports.forgotPassword = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
const email_1 = require("../utils/email");
const User_1 = require("../models/User");
const generateToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        tokenVersion: user.tokenVersion || 0
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '15m' });
};
const generateRefreshToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        tokenVersion: user.tokenVersion || 0,
        type: 'refresh'
    };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
};
const verifyToken = (token, secret) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
const generateEmailVerificationToken = () => {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return { token, expiresAt };
};
// Token and cookie configuration
const ACCESS_TOKEN_EXPIRY = 60 * 15; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
const setTokenCookies = (res, accessToken, refreshToken) => {
    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ACCESS_TOKEN_EXPIRY * 1000
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth/refresh-token',
        maxAge: REFRESH_TOKEN_EXPIRY * 1000
    });
};
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password } = req.body;
        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }
        // Check if user already exists
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                code: 'EMAIL_EXISTS',
                message: 'Email already registered.'
            });
        }
        // Generate email verification token
        const { token: emailVerificationToken, expiresAt: emailVerificationExpires } = generateEmailVerificationToken();
        // Create user
        const user = yield User_1.User.create({
            firstName,
            lastName,
            email,
            password,
            emailVerificationToken: generateEmailVerificationToken().token,
            emailVerificationExpires: generateEmailVerificationToken().expiresAt
        });
        // Generate tokens
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        // Set cookies
        setTokenCookies(res, accessToken, refreshToken);
        // Send verification email
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${user.emailVerificationToken}`;
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: 'Verify Your Email',
            html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
        });
        return res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error during registration'
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = yield User_1.User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }
        // Check if password matches
        const isMatch = yield user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }
        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                code: 'ACCOUNT_DISABLED',
                message: 'Your account has been disabled. Please contact support.'
            });
        }
        // Generate tokens
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        // Set cookies
        setTokenCookies(res, accessToken, refreshToken);
        // Update last login
        user.lastLogin = new Date();
        yield user.save();
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error during login'
        });
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'No refresh token provided'
            });
        }
        // Verify refresh token
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            throw new Error('REFRESH_TOKEN_SECRET is not defined');
        }
        let decoded;
        try {
            decoded = verifyToken(refreshToken, secret);
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Invalid refresh token'
            });
        }
        // Check if token type is refresh
        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Invalid token type'
            });
        }
        // Find user
        const user = yield User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found'
            });
        }
        // Check token version
        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Token has been revoked'
            });
        }
        // Generate new tokens
        const newAccessToken = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);
        // Set cookies
        setTokenCookies(res, newAccessToken, newRefreshToken);
        return res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Refresh token error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error refreshing token'
        });
    }
});
exports.refreshToken = refreshToken;
// @desc    Logout user / clear refresh token
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        // Increment token version to invalidate all existing tokens
        if (req.user) {
            return User_1.User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } }, { new: true })
                .then(() => {
                return res.status(200).json({
                    success: true,
                    message: 'Successfully logged out.'
                });
            })
                .catch((error) => {
                logger_1.logger.error('Logout error:', error);
                return res.status(500).json({
                    success: false,
                    code: 'SERVER_ERROR',
                    message: 'Error logging out.'
                });
            });
        }
        else {
            return res.status(200).json({
                success: true,
                message: 'Successfully logged out.'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error logging out.'
        });
    }
});
exports.logout = logout;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists for security
            return res.status(200).json({
                success: true,
                message: 'If your email is registered, you will receive a password reset link.'
            });
        }
        // Generate reset token
        // Generate reset token and expiry (1 hour)
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        const resetPasswordExpire = Date.now() + 3600000; // 1 hour
        const resetPasswordToken = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        // Update user with reset token and expiry
        user.passwordResetToken = resetPasswordToken;
        user.passwordResetExpires = new Date(resetPasswordExpire);
        yield user.save({ validateBeforeSave: false });
        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: 'Password Reset Request',
            template: 'reset-password',
            context: {
                resetUrl,
                userName: user.firstName
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Email sent'
        });
    }
    catch (error) {
        logger_1.logger.error('Forgot password error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error processing forgot password request.'
        });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.params.token || '';
        const { password } = req.body;
        // Hash token
        const resetPasswordToken = crypto_1.default
            .createHash('sha256')
            .update(token)
            .digest('hex');
        // Find user by token and check expiry
        const user = yield User_1.User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired reset token.'
            });
        }
        // Set new password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.tokenVersion += 1; // Invalidate all existing tokens
        yield user.save();
        // Send confirmation email
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: 'Password Changed',
            template: 'reset-password',
            context: {
                resetUrl: `${process.env.CLIENT_URL}/login`,
                userName: user.firstName
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now log in with your new password.'
        });
    }
    catch (error) {
        logger_1.logger.error('Reset password error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error resetting password.'
        });
    }
});
exports.resetPassword = resetPassword;
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'User not authenticated.'
            });
        }
        const user = yield User_1.User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
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
            code: 'SERVER_ERROR',
            message: 'Error fetching user data.'
        });
    }
});
exports.getMe = getMe;
// @desc    Update user details
// @route   PUT /api/auth/update-details
// @access  Private
const updateDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { firstName, lastName, email } = req.body;
        // Build fields to update
        const fieldsToUpdate = {};
        if (firstName)
            fieldsToUpdate.firstName = firstName;
        if (lastName)
            fieldsToUpdate.lastName = lastName;
        if (email)
            fieldsToUpdate.email = email;
        // Find and update user
        const user = yield User_1.User.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, { $set: fieldsToUpdate }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger_1.logger.error('Update user details error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error updating user details.'
        });
    }
});
exports.updateDetails = updateDetails;
// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const currentPassword = req.body.currentPassword || '';
        const newPassword = req.body.newPassword || '';
        // Check if user exists
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found.'
            });
        }
        // Verify current password
        const isMatch = yield user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Current password is incorrect.'
            });
        }
        // Update password
        user.password = newPassword;
        user.tokenVersion += 1; // Invalidate all existing tokens
        yield user.save();
        // Send password changed email
        try {
            yield (0, email_1.sendEmail)({
                to: user.email,
                subject: 'Password Changed',
                template: 'password-changed',
                context: {
                    name: `${user.firstName} ${user.lastName}`
                }
            });
        }
        catch (emailError) {
            logger_1.logger.error('Failed to send password changed email:', emailError);
            // Continue execution even if email fails
        }
        // Generate new token
        const token = generateToken(user);
        return res.status(200).json({
            success: true,
            token,
            message: 'Password updated successfully.'
        });
    }
    catch (error) {
        logger_1.logger.error('Update password error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error updating password.'
        });
    }
});
exports.updatePassword = updatePassword;
