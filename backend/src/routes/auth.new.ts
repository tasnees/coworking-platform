import express from 'express';
import * as authController from '../controllers/auth.controller.clean';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);
router.post('/update-password', authenticateToken, authController.updatePassword);

export default router;
