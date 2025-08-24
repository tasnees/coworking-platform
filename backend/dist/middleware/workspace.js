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
exports.isWorkspacePublic = exports.isWorkspaceOwner = exports.isWorkspaceAdmin = exports.isWorkspaceMember = void 0;
const Workspace_1 = __importDefault(require("../models/Workspace"));
const logger_1 = require("../utils/logger");
/**
 * Middleware to validate workspace membership and attach workspace to request
 */
const isWorkspaceMember = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const workspace = yield Workspace_1.default.findOne({
            _id: req.params.workspaceId || req.params.id,
            $or: [
                { members: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id },
                { admins: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id },
                { owner: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id }
            ]
        });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                code: 'WORKSPACE_NOT_FOUND',
                message: 'Workspace not found or you do not have access to it.'
            });
        }
        // Attach workspace to request for use in subsequent middleware/controllers
        req.workspace = workspace;
        next();
    }
    catch (error) {
        logger_1.logger.error('Workspace middleware error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error accessing workspace.'
        });
    }
});
exports.isWorkspaceMember = isWorkspaceMember;
/**
 * Middleware to check if user is a workspace admin
 */
const isWorkspaceAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const workspace = yield Workspace_1.default.findOne({
            _id: req.params.workspaceId || req.params.id,
            $or: [
                { admins: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id },
                { owner: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id }
            ]
        });
        if (!workspace) {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: 'Admin access required for this workspace.'
            });
        }
        // Attach workspace to request for use in subsequent middleware/controllers
        req.workspace = workspace;
        next();
    }
    catch (error) {
        logger_1.logger.error('Workspace admin middleware error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error verifying workspace admin status.'
        });
    }
});
exports.isWorkspaceAdmin = isWorkspaceAdmin;
/**
 * Middleware to check if user is the workspace owner
 */
const isWorkspaceOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const workspace = yield Workspace_1.default.findOne({
            _id: req.params.workspaceId || req.params.id,
            owner: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        if (!workspace) {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: 'Only the workspace owner can perform this action.'
            });
        }
        // Attach workspace to request for use in subsequent middleware/controllers
        req.workspace = workspace;
        next();
    }
    catch (error) {
        logger_1.logger.error('Workspace owner middleware error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error verifying workspace ownership.'
        });
    }
});
exports.isWorkspaceOwner = isWorkspaceOwner;
/**
 * Middleware to check if a workspace is public
 */
const isWorkspacePublic = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workspace = yield Workspace_1.default.findOne({
            _id: req.params.workspaceId || req.params.id,
            isPublic: true
        });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                message: 'Workspace not found or is not public.'
            });
        }
        // Attach workspace to request for use in subsequent middleware/controllers
        req.workspace = workspace;
        next();
    }
    catch (error) {
        logger_1.logger.error('Workspace public check error:', error);
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error checking workspace visibility.'
        });
    }
});
exports.isWorkspacePublic = isWorkspacePublic;
