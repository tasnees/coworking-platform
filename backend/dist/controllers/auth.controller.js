"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const User_1 = require("../models/User");
const tokens_1 = require("../utils/tokens");
const logger_1 = require("../utils/logger");
const jsonwebtoken_1 = require("jsonwebtoken");
exports.authController = {
    async register(req) {
        try {
            const { email, password, role = 'member', firstName, lastName } = req.body;
            const existingUser = await User_1.User.findOne({ email });
            if (existingUser) {
                throw new Error('User already exists');
            }
            const user = await User_1.User.create({
                email,
                password,
                role,
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
            });
            // Ensure user has required properties
            if (!user._id) {
                throw new Error('User creation failed - missing _id');
            }
            const token = (0, tokens_1.generateToken)(user);
            const refreshToken = (0, tokens_1.generateRefreshToken)(user);
            return {
                success: true,
                token,
                refreshToken,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            throw error;
        }
    },
    async login(req) {
        try {
            const { email, password } = req.body;
            // 1. Find user by email including the password field
            const userDoc = await User_1.User.findOne({ email }).select('+password').lean();
            if (!userDoc) {
                logger_1.logger.warn(`Login attempt with non-existent email: ${email}`);
                throw new Error('Invalid credentials');
            }
            // 2. Check if user is active
            if (userDoc.isActive === false) {
                logger_1.logger.warn(`Login attempt for inactive user: ${email}`);
                throw new Error('Account is not active');
            }
            // 3. Find user document with instance methods
            const user = await User_1.User.findById(userDoc._id).exec();
            if (!user) {
                logger_1.logger.warn(`User not found after initial lookup: ${email}`);
                throw new Error('Invalid credentials');
            }
            // 4. Verify password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                logger_1.logger.warn(`Invalid password attempt for user: ${email}`);
                throw new Error('Invalid credentials');
            }
            // 5. Update last login timestamp
            user.lastLogin = new Date();
            await user.save();
            // 6. Generate tokens
            const token = (0, tokens_1.generateToken)(user);
            const refreshToken = (0, tokens_1.generateRefreshToken)(user);
            logger_1.logger.info(`Successful login for user: ${email}`);
            // Create response with proper typing for user fields
            const userResponse = {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                ...(user.firstName && { firstName: user.firstName }),
                ...(user.lastName && { lastName: user.lastName })
            };
            return {
                success: true,
                token,
                refreshToken,
                user: userResponse,
            };
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            throw error;
        }
    },
    async refreshToken(req) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                throw new Error('No refresh token provided');
            }
            const secret = process.env.REFRESH_TOKEN_SECRET;
            if (!secret) {
                throw new Error('REFRESH_TOKEN_SECRET is not defined');
            }
            const decoded = (0, jsonwebtoken_1.verify)(refreshToken, secret);
            if (!decoded?.userId || typeof decoded.userId !== 'string') {
                throw new Error('Invalid refresh token: Missing or invalid userId');
            }
            const user = await User_1.User.findById(decoded.userId);
            if (!user?._id) {
                throw new Error('User not found');
            }
            const token = (0, tokens_1.generateToken)(user);
            const newRefreshToken = (0, tokens_1.generateRefreshToken)(user);
            const userResponse = {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                ...(user.firstName && { firstName: user.firstName }),
                ...(user.lastName && { lastName: user.lastName })
            };
            return {
                success: true,
                token,
                refreshToken: newRefreshToken,
                user: userResponse,
            };
        }
        catch (error) {
            logger_1.logger.error('Token refresh error:', error);
            throw error;
        }
    },
    async logout() {
        try {
            return {
                success: true,
                message: 'Logged out successfully',
                clearCookie: {
                    name: 'refreshToken',
                    options: {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                    },
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            throw error;
        }
    },
    async updatePassword(req) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new Error('Current password and new password are required');
            }
            if (!req.user?._id) {
                throw new Error('User not authenticated or invalid user data');
            }
            const userId = req.user._id;
            const user = await User_1.User.findById(userId).select('+password');
            if (!user) {
                throw new Error('User not found');
            }
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                throw new Error('Current password is incorrect');
            }
            user.password = newPassword;
            user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all existing tokens
            await user.save();
            return {
                success: true,
                message: 'Password updated successfully',
                clearCookie: {
                    name: 'refreshToken',
                    options: {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict'
                    }
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Password update error:', error);
            throw error;
        }
    },
};
exports.default = exports.authController;
