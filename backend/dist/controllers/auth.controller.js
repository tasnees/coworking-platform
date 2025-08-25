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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.updatePassword = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
// -------------------------------
// 4. Token Helpers
// -------------------------------
const ACCESS_TOKEN_EXPIRY = 60 * 15; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET;
// Explicitly type jwt.sign
const generateToken = (user) => {
    var _a;
    const payload = { userId: user.id, tokenVersion: (_a = user.tokenVersion) !== null && _a !== void 0 ? _a : 0 };
    const options = { expiresIn: ACCESS_TOKEN_EXPIRY };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
};
const generateRefreshToken = (user) => {
    var _a;
    const payload = { userId: user.id, tokenVersion: (_a = user.tokenVersion) !== null && _a !== void 0 ? _a : 0, type: 'refresh' };
    const options = { expiresIn: REFRESH_TOKEN_EXPIRY };
    return jsonwebtoken_1.default.sign(payload, REFRESH_TOKEN_SECRET, options);
};
// Explicitly type jwt.verify
const verifyToken = (token, secret) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
// -------------------------------
// 5. Controller Helpers
// -------------------------------
const setTokenCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ACCESS_TOKEN_EXPIRY * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });
};
const clearTokenCookies = (res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
};
// -------------------------------
// 6. Controllers
// -------------------------------
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password, role = 'member' } = req.body;
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });
        // Explicitly type bcrypt.hash
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new User_1.User({ firstName, lastName, email, password: hashedPassword, role });
        yield user.save();
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        setTokenCookies(res, accessToken, refreshToken);
        const _a = user.toObject(), { password: _ } = _a, userData = __rest(_a, ["password"]);
        return res.status(201).json({ user: userData, accessToken, refreshToken });
    }
    catch (error) {
        logger_1.logger.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        // Explicitly type bcrypt.compare
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid credentials' });
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        setTokenCookies(res, accessToken, refreshToken);
        const _a = user.toObject(), { password: _ } = _a, userData = __rest(_a, ["password"]);
        return res.json({ user: userData, accessToken, refreshToken });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login' });
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.body.refreshToken;
        if (!token)
            return res.status(401).json({ message: 'No refresh token provided' });
        const decoded = verifyToken(token, REFRESH_TOKEN_SECRET);
        if (decoded.type !== 'refresh')
            return res.status(403).json({ message: 'Invalid token type' });
        const user = yield User_1.User.findById(decoded.userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (user.tokenVersion !== decoded.tokenVersion)
            return res.status(403).json({ message: 'Token revoked' });
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        setTokenCookies(res, accessToken, refreshToken);
        return res.json({ accessToken, refreshToken });
    }
    catch (error) {
        logger_1.logger.error('Refresh token error:', error);
        return res.status(403).json({ message: 'Invalid refresh token' });
    }
});
exports.refreshToken = refreshToken;
const logout = (_req, res) => {
    clearTokenCookies(res);
    return res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currentPassword, newPassword } = req.body;
        const { user } = req;
        if (!user)
            return res.status(401).json({ message: 'Not authenticated' });
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Current password is incorrect' });
        user.password = yield bcryptjs_1.default.hash(newPassword, 10);
        user.tokenVersion = ((_a = user.tokenVersion) !== null && _a !== void 0 ? _a : 0) + 1;
        yield user.save();
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        setTokenCookies(res, accessToken, refreshToken);
        return res.json({ message: 'Password updated successfully', accessToken, refreshToken });
    }
    catch (error) {
        logger_1.logger.error('Update password error:', error);
        return res.status(500).json({ message: 'Error updating password' });
    }
});
exports.updatePassword = updatePassword;
const getMe = (req, res) => {
    const { user } = req;
    if (!user)
        return res.status(401).json({ message: 'Not authenticated' });
    const _a = user.toObject(), { password } = _a, userData = __rest(_a, ["password"]);
    return res.json({ user: userData });
};
exports.getMe = getMe;
