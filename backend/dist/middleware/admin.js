"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.ForbiddenError = void 0;
class ForbiddenError extends Error {
    constructor(message = 'Access denied') {
        super(message);
        this.status = 403;
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
const adminMiddleware = (req, _res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        throw new ForbiddenError('Admin access required');
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
