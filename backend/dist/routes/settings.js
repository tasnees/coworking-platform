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
const express_1 = __importDefault(require("express"));
const Settings_1 = __importDefault(require("../models/Settings"));
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const router = express_1.default.Router();
// Get current settings
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield Settings_1.default.getSettings();
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}));
// Update settings (admin only)
router.patch('/', auth_1.authMiddleware, admin_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requireAdminApproval, siteName, maintenanceMode, maxUsers, sessionTimeout } = req.body;
        const settings = yield Settings_1.default.getSettings();
        if (requireAdminApproval !== undefined)
            settings.requireAdminApproval = requireAdminApproval;
        if (siteName !== undefined)
            settings.siteName = siteName;
        if (maintenanceMode !== undefined)
            settings.maintenanceMode = maintenanceMode;
        if (maxUsers !== undefined)
            settings.maxUsers = maxUsers;
        if (sessionTimeout !== undefined)
            settings.sessionTimeout = sessionTimeout;
        settings.updatedBy = req.user.userId;
        settings.updatedAt = new Date();
        yield settings.save();
        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    }
    catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}));
exports.default = router;
