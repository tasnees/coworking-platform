"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// Auth routes
router.post('/register', auth_controller_1.authController.register);
router.post('/login', auth_controller_1.authController.login);
router.post('/refresh-token', auth_controller_1.authController.refreshToken);
router.post('/logout', auth_1.default, auth_controller_1.authController.logout);
router.post('/update-password', auth_1.default, auth_controller_1.authController.updatePassword);
exports.default = router;
