import mongoose from 'mongoose';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';
import { User, IUserDocument } from '../models/User';

// Token generation types

// Token generation types
type TokenPayload = {
  userId: string | mongoose.Types.ObjectId;
  tokenVersion: number;
  type?: string;
  iat?: number;
  exp?: number;
};

const generateToken = (user: IUserDocument): string => {
  // Ensure user._id is treated as mongoose.Types.ObjectId
  const userId =
    typeof user._id === 'object' && user._id !== null && 'toString' in user._id
      ? (user._id as mongoose.Types.ObjectId).toString()
      : String(user._id);

  const payload: TokenPayload = {
    userId: userId,
    tokenVersion: user.tokenVersion || 0
  };
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, secret, { expiresIn: '15m' });
};

const generateRefreshToken = (user: IUserDocument): string => {
  const payload: TokenPayload = {
    userId: String(user._id),
    tokenVersion: user.tokenVersion || 0,
    type: 'refresh'
  };
  
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

const verifyToken = (token: string, secret: string): TokenPayload => {
  return jwt.verify(token, secret) as TokenPayload;
};

const generateEmailVerificationToken = (): { token: string; expiresAt: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, expiresAt };
};

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// Token and cookie configuration
const ACCESS_TOKEN_EXPIRY = 60 * 15; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

interface AuthRequest extends Request {
  user?: IUserDocument;
  body: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    token?: string;
    newPassword?: string;
    currentPassword?: string;
    refreshToken?: string;
  };
}

// Type for user document with Mongoose document methods
interface UserDocument extends IUserDocument {
  _id: mongoose.Types.ObjectId;
}

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  // Set HTTP-only cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ACCESS_TOKEN_EXPIRY * 1000
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh-token',
    maxAge: REFRESH_TOKEN_EXPIRY * 1000
  });
};

// Request interfaces
interface RegisterRequest extends Request {
  body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'member' | 'staff' | 'admin';
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken?: string;
  };
}

interface ForgotPasswordRequest extends Request {
  body: {
    email: string;
  };
}

interface ResetPasswordRequest extends Request {
  params: {
    token?: string;
  };
  body: {
    password: string;
  };
}

interface UpdatePasswordRequest extends Request {
  user?: IUserDocument;
  body: {
    currentPassword: string;
    newPassword: string;
  };
  // Index signature for additional properties
  [key: string]: unknown;
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: RegisterRequest, res: Response): Promise<Response> => {
  try {
    const { firstName, lastName, email, password, role = 'member' } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        code: 'MISSING_FIELDS',
        message: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        code: 'EMAIL_EXISTS',
        message: 'Email already registered.',
      });
    }

    // Validate role
    const validRoles = ['member', 'staff', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_ROLE',
        message: 'Invalid role specified. Must be one of: member, staff, admin',
      });
    }

    // Generate verification token
    const { token, expiresAt } = generateEmailVerificationToken();
    
    // Create user with email verification token
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      isEmailVerified: false,
      tokenVersion: 0,
      emailVerificationToken: token,
      emailVerificationExpire: expiresAt,
      isActive: true,
    }) as UserDocument;
    
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${user.emailVerificationToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      template: 'verify-email',
      context: {
        name: user.firstName,
        verificationUrl,
        expiry: '24 hours'
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export const login = async (req: LoginRequest, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DISABLED',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error during login'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
interface RefreshTokenRequest extends Request {
  body: {
    refreshToken?: string;
  };
}

export const refreshToken = async (req: RefreshTokenRequest, res: Response): Promise<Response> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'No refresh token provided'
      });
    }

    // Verify refresh token
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }

    let decoded;
    try {
      decoded = verifyToken(refreshToken, secret);
    } catch (error) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid refresh token'
      });
    }

    // Check if token type is refresh
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid token type'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId).exec() as IUserDocument | null;
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // Check token version
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Token has been revoked'
      });
    }

    // Generate new tokens
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Set cookies
    setTokenCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error refreshing token',
    });
  }
};

// @desc    Logout user / clear refresh token
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Increment token version to invalidate all existing tokens
    if (req.user) {
      return User.findByIdAndUpdate(
        req.user.id,
        { $inc: { tokenVersion: 1 } },
        { new: true }
      )
        .then(() => {
          return res.status(200).json({
            success: true,
            message: 'Successfully logged out.'
          });
        })
        .catch((error) => {
          logger.error('Logout error:', error);
          return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Error logging out.'
          });
        });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Successfully logged out.'
      });
    }
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error logging out.'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
interface ForgotPasswordRequest extends Request {
  body: {
    email: string;
  };
}

export const forgotPassword = async (req: ForgotPasswordRequest, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.'
      });
    }

    // Generate reset token
    // Generate reset token and expiry (1 hour)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpire = Date.now() + 3600000; // 1 hour
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Update user with reset token and expiry
    user.passwordResetToken = resetPasswordToken;
    user.passwordResetExpires = new Date(resetPasswordExpire);
    await user.save({ validateBeforeSave: false });
    
    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'reset-password',
      context: {
        resetUrl,
        userName: user.firstName
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error processing forgot password request.'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
interface ResetPasswordRequest extends Request {
  params: {
    token?: string;
  };
  body: {
    password: string;
  };
}

export const resetPassword = async (req: ResetPasswordRequest, res: Response): Promise<Response> => {
  try {
    const token = req.params.token || '';

    const { password } = req.body;

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token and check expiry
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token.'
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Type assertion to ensure tokenVersion exists
    const userDoc = user as IUserDocument;
    userDoc.tokenVersion = (userDoc.tokenVersion || 0) + 1; // Invalidate all existing tokens
    await userDoc.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Password Changed',
      template: 'reset-password',
      context: { 
        resetUrl: `${process.env.CLIENT_URL}/login`,
        userName: user.firstName 
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error resetting password.'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'User not authenticated.'
      });
    }
    
    const user = await User.findById(req.user.id).select('-password').lean() as IUserDocument | null;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error fetching user data.'
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/update-details
// @access  Private
export const updateDetails = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { firstName, lastName, email } = req.body;

    // Build fields to update
    const fieldsToUpdate: { firstName?: string; lastName?: string; email?: string } = {};
    
    if (firstName) fieldsToUpdate.firstName = firstName;
    if (lastName) fieldsToUpdate.lastName = lastName;
    if (email) fieldsToUpdate.email = email;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Update user details error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error updating user details.'
    });
  }
};

// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = async (req: UpdatePasswordRequest, res: Response): Promise<Response> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Find user with password
    const user = await User.findById(req.user._id).select('+password').exec() as IUserDocument | null;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    // Generate new tokens with proper type casting
    const accessToken = generateToken(user as IUserDocument);
    const refreshToken = generateRefreshToken(user as IUserDocument);

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Update password error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Error updating password.'
    });
  }
};