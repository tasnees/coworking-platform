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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authMiddleware = (req, res, next) => {
    // Get token from header
    let token;
    // Try different ways to get the authorization header
    if (req.get) {
        token = req.get('Authorization') || req.get('authorization');
    }
    else if (req.headers) {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        // Handle both string and string[] cases
        if (Array.isArray(authHeader)) {
            token = authHeader[0];
        }
        else {
            token = authHeader;
        }
    }
    // Extract token from "Bearer TOKEN"
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
    }
    else {
        token = undefined;
    }
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'No token provided'
        });
        return;
    }
    // Verify token and get user
    const processToken = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                res.status(500).json({
                    success: false,
                    message: 'Server configuration error'
                });
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            const user = yield User_1.User.findById(decoded.userId).select('-password');
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    });
    processToken().catch(() => {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    });
};
exports.authMiddleware = authMiddleware;
