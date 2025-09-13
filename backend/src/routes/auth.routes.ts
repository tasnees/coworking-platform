import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import authController from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),
    body('name').not().isEmpty().withMessage('Name is required'),
  ],
  validateRequest,
  authLimiter,
  authController.register
);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  validateRequest,
  authLimiter,
  authController.login
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post(
  '/refresh-token',
  [
    body('refreshToken').not().isEmpty().withMessage('Refresh token is required'),
  ],
  validateRequest,
  authController.refreshToken
);

// @route   POST /api/auth/logout
// @desc    Logout user / clear refresh token
// @access  Private
router.post(
  '/logout',
  [
    body('refreshToken').not().isEmpty().withMessage('Refresh token is required'),
  ],
  validateRequest,
  authController.logout
);

export default router;
