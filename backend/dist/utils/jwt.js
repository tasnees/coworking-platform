"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = generateTokens;
exports.verifyToken = verifyToken;
const tokens_1 = require("./tokens");
/**
 * Generate both access and refresh tokens for a user
 */
function generateTokens(user) {
    return {
        accessToken: (0, tokens_1.generateToken)(user),
        refreshToken: (0, tokens_1.generateRefreshToken)(user)
    };
}
/**
 * Verify a JWT token (access or refresh)
 */
function verifyToken(token, type = 'access') {
    try {
        return type === 'access'
            ? (0, tokens_1.verifyToken)(token)
            : (0, tokens_1.verifyRefreshToken)(token);
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map