"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
class ForbiddenError extends Error {
    constructor(message = 'Access denied') {
        super(message);
        this.status = 403;
        this.name = 'ForbiddenError';
    }
}
const adminMiddleware = (req, _res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        const error = new ForbiddenError('Admin access required');
        return next(error);
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
