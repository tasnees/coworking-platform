"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenPayload = exports.isTokenExpired = exports.generatePasswordResetToken = exports.generateEmailVerificationToken = exports.verifyRefreshToken = exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Parse time string (e.g. '1d', '24h') to seconds
const parseTimeToSeconds = (timeStr) => {
    const value = parseInt(timeStr, 10);
    if (isNaN(value))
        throw new Error(`Invalid time format: ${timeStr}`);
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
    // Use custom interface to handle typing
    const options = {
        expiresIn,
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
    // Use custom interface to handle typing
    const options = {
        expiresIn,
        algorithm: 'HS256'
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid refresh token type');
        }
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const generateEmailVerificationToken = () => {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expirationHours = parseInt(process.env.EMAIL_VERIFICATION_EXPIRE_HOURS || '24', 10);
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
    return {
        token,
        expiresAt
    };
};
exports.generateEmailVerificationToken = generateEmailVerificationToken;
const generatePasswordResetToken = () => {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expirationMinutes = parseInt(process.env.PASSWORD_RESET_EXPIRE_MINUTES || '10', 10);
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    return {
        token,
        expiresAt
    };
};
exports.generatePasswordResetToken = generatePasswordResetToken;
const isTokenExpired = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.exp))
            return true;
        return Date.now() >= decoded.exp * 1000;
    }
    catch (_a) {
        return true;
    }
};
exports.isTokenExpired = isTokenExpired;
const getTokenPayload = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        return decoded;
    }
    catch (_a) {
        return null;
    }
};
exports.getTokenPayload = getTokenPayload;
