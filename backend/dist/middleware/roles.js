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
exports.isOwner = exports.isStaff = exports.isAdmin = void 0;
const logger_1 = require("../utils/logger");
const mongoose_1 = require("mongoose");
// ----- Role-based middleware -----
const isAdmin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin')
        return next();
    logger_1.logger.warn('Unauthorized access attempt: not admin');
    res.status(401).json({ message: 'Unauthorized: Admin only' });
};
exports.isAdmin = isAdmin;
const isStaff = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'staff')
        return next();
    logger_1.logger.warn('Unauthorized access attempt: not staff');
    res.status(401).json({ message: 'Unauthorized: Staff only' });
};
exports.isStaff = isStaff;
const isOwner = (model, paramName = 'id', userField = 'user') => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const resourceId = req.params[paramName];
            if (!resourceId) {
                res.status(400).json({ message: 'Missing resource ID' });
                return;
            }
            const resource = yield model.findById(resourceId);
            if (!resource) {
                res.status(404).json({ message: 'Resource not found' });
                return;
            }
            const resourceUser = resource[userField];
            let resourceUserId;
            if (typeof resourceUser === 'string')
                resourceUserId = resourceUser;
            else if (resourceUser instanceof mongoose_1.Types.ObjectId)
                resourceUserId = resourceUser.toString();
            else if (resourceUser && typeof resourceUser === 'object') {
                const userObj = resourceUser;
                if (userObj._id)
                    resourceUserId =
                        typeof userObj._id === 'string'
                            ? userObj._id
                            : userObj._id.toString();
            }
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const userIdString = userId && typeof userId !== 'string' ? userId.toString() : userId;
            if (resourceUserId && userIdString && resourceUserId === userIdString) {
                req.resource = resource;
                next();
                return;
            }
            logger_1.logger.warn('Unauthorized access attempt: not owner');
            res.status(401).json({ message: 'Unauthorized: Not the owner' });
        }
        catch (err) {
            logger_1.logger.error('Error in ownership check', err instanceof Error ? err : { error: err });
            res.status(500).json({ message: 'Server error' });
        }
    });
};
exports.isOwner = isOwner;
