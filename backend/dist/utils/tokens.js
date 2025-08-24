"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePasswordResetToken = exports.generateEmailVerificationToken = exports.generateRefreshToken = exports.generateToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Parse time string (e.g. '1d', '24h') to seconds
const parseTimeToSeconds = (timeStr) => {
    const value = parseInt(timeStr, 10);
    if (timeStr.endsWith('d'))
        return value * 24 * 60 * 60;
    if (timeStr.endsWith('h'))
        return value * 60 * 60;
    if (timeStr.endsWith('m'))
        return value * 60;
    return value; // Assume seconds if no unit specified
};
const generateToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        tokenVersion: user.tokenVersion
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const expiresIn = process.env.JWT_EXPIRE || '1d';
    const options = {
        expiresIn: expiresIn,
        algorithm: 'HS256'
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
const generateRefreshToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        tokenVersion: user.tokenVersion,
        type: 'refresh'
    };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
    }
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRE || '7d';
    const options = {
        expiresIn: expiresIn,
        algorithm: 'HS256'
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateRefreshToken = generateRefreshToken;
const generateEmailVerificationToken = () => {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return {
        token,
        expiresAt
    };
};
exports.generateEmailVerificationToken = generateEmailVerificationToken;
const generatePasswordResetToken = () => {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return {
        token,
        expiresAt
    };
};
exports.generatePasswordResetToken = generatePasswordResetToken;
