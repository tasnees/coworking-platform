"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const auth_controller_1 = require("../controllers/auth.controller");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please include a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
    (0, express_validator_1.body)('name').not().isEmpty().withMessage('Name is required'),
], validateRequest_1.validateRequest, rateLimit_1.authLimiter, auth_controller_1.authController.register);
// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please include a valid email'),
    (0, express_validator_1.body)('password').exists().withMessage('Password is required'),
], validateRequest_1.validateRequest, rateLimit_1.authLimiter, auth_controller_1.authController.login);
// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', [
    (0, express_validator_1.body)('refreshToken').not().isEmpty().withMessage('Refresh token is required'),
], validateRequest_1.validateRequest, auth_controller_1.authController.refreshToken);
// @route   POST /api/auth/logout
// @desc    Logout user / clear refresh token
// @access  Private
router.post('/logout', [
    (0, express_validator_1.body)('refreshToken').not().isEmpty().withMessage('Refresh token is required'),
], validateRequest_1.validateRequest, auth_controller_1.authController.logout);
exports.default = router;
