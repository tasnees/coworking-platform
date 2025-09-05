/* eslint-disable @typescript-eslint/no-namespace */
import { Types } from 'mongoose';
import { User, IUserDocument } from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/tokens';
import { logger } from '../utils/logger';
import { Role } from '../middleware/roles';
import { verify, JwtPayload } from 'jsonwebtoken';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    role: Role;
    firstName?: string;
    lastName?: string;
  };
  clearCookie?: {
    name: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict' | 'lax' | 'none' | boolean;
      path?: string;
      domain?: string;
    };
  };
  setCookie?: {
    name: string;
    value: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict' | 'lax' | 'none' | boolean;
      maxAge?: number;
      path?: string;
      domain?: string;
    };
  };
}

// Extend Express Request type for authenticated user
interface AuthRequest extends Request {
  user?: IUserDocument & { tokenVersion: number };
  cookies: {
    refreshToken?: string;
    [key: string]: string | undefined;
  };
}

interface RegisterBody {
  email: string;
  password: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface UpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export const authController = {
  async register(req: AuthRequest & { body: RegisterBody }): Promise<AuthResponse> {
    try {
      const { email, password, role = 'member', firstName, lastName } = req.body as RegisterBody;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const user = await User.create({
        email,
        password,
        role,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      });

      // Ensure user has required properties
      if (!user._id) {
        throw new Error('User creation failed - missing _id');
      }

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      return {
        success: true,
        token,
        refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role as Role,
          firstName: user.firstName as string | undefined,
          lastName: user.lastName as string | undefined,
        },
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  },

  async login(req: AuthRequest & { body: LoginBody }): Promise<AuthResponse> {
    try {
      const { email, password } = req.body;

      // 1. Find user by email including the password field
      const userDoc = await User.findOne({ email }).select('+password').lean();
      if (!userDoc) {
        logger.warn(`Login attempt with non-existent email: ${email}`);
        throw new Error('Invalid credentials');
      }

      // 2. Check if user is active
      if (userDoc.isActive === false) {
        logger.warn(`Login attempt for inactive user: ${email}`);
        throw new Error('Account is not active');
      }

      // 3. Find user document with instance methods
      const user = await User.findById(userDoc._id).exec() as (IUserDocument & { _id: Types.ObjectId }) | null;
      if (!user) {
        logger.warn(`User not found after initial lookup: ${email}`);
        throw new Error('Invalid credentials');
      }
      
      // 4. Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.warn(`Invalid password attempt for user: ${email}`);
        throw new Error('Invalid credentials');
      }

      // 5. Update last login timestamp
      user.lastLogin = new Date();
      await user.save();

      // 6. Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      logger.info(`Successful login for user: ${email}`);

      // Create response with proper typing for user fields
      const userResponse = {
        id: user._id.toString(),
        email: user.email,
        role: user.role as Role,
        ...(user.firstName && { firstName: user.firstName }),
        ...(user.lastName && { lastName: user.lastName })
      };

      return {
        success: true,
        token,
        refreshToken,
        user: userResponse,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  },

  async refreshToken(req: AuthRequest): Promise<AuthResponse> {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        throw new Error('No refresh token provided');
      }

      const secret = process.env.REFRESH_TOKEN_SECRET;
      if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined');
      }

      const decoded = verify(refreshToken, secret) as JwtPayload & { userId: string };
      if (!decoded?.userId || typeof decoded.userId !== 'string') {
        throw new Error('Invalid refresh token: Missing or invalid userId');
      }

      const user = await User.findById(decoded.userId);
      if (!user?._id) {
        throw new Error('User not found');
      }

      const token = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      const userResponse = {
        id: user._id.toString(),
        email: user.email,
        role: user.role as Role,
        ...(user.firstName && { firstName: user.firstName }),
        ...(user.lastName && { lastName: user.lastName })
      };

      return {
        success: true,
        token,
        refreshToken: newRefreshToken,
        user: userResponse,
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  },

  async logout(): Promise<AuthResponse> {
    try {
      return {
        success: true,
        message: 'Logged out successfully',
        clearCookie: {
          name: 'refreshToken',
          options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          },
        },
      };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  },

  async updatePassword(req: AuthRequest & { body: UpdatePasswordBody }): Promise<AuthResponse> {
    try {
      const { currentPassword, newPassword } = req.body as UpdatePasswordBody;
      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }

      if (!req.user?._id) {
        throw new Error('User not authenticated or invalid user data');
      }
      const userId = req.user._id;

      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      user.password = newPassword;
      user.tokenVersion = ((user.tokenVersion as number) || 0) + 1; // Invalidate all existing tokens
      await user.save();

      return {
        success: true,
        message: 'Password updated successfully',
        clearCookie: {
          name: 'refreshToken',
          options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          }
        }
      };
    } catch (error) {
      logger.error('Password update error:', error);
      throw error;
    }
  },
};

export default authController;