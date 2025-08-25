import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken, verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { IUserDocument } from '../@types/express';

// Extend Express Request type for authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      cookies: {
        refreshToken?: string;
        [key: string]: string | undefined;
      };
    }
  }
}

// Request body interfaces
interface RegisterBody {
  email: string;
  password: string;
  role?: string;
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
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, role = 'member' } = req.body as RegisterBody;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({ email, password, role });
      await user.save();

      const { accessToken, refreshToken } = generateToken(user);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user: { id: user._id, email: user.email, role: user.role },
        accessToken,
      });
    } catch (error) {
      logger.error('Registration error:', error);
      return res.status(500).json({ message: 'Server error during registration' });
    }
  },

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body as LoginBody;

      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const { accessToken, refreshToken } = generateToken(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        message: 'Login successful',
        user: { id: user._id, email: user.email, role: user.role },
        accessToken,
      });
    } catch (error) {
      logger.error('Login error:', error);
      return res.status(500).json({ message: 'Server error during login' });
    }
  },

  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
      }

      const decoded = verifyToken(refreshToken, 'refresh');
      if (!decoded) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateToken(user);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({ accessToken });
    } catch (error) {
      logger.error('Token refresh error:', error);
      return res.status(500).json({ message: 'Server error during token refresh' });
    }
  },

  async logout(_req: Request, res: Response): Promise<Response> {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return res.json({ message: 'Logout successful' });
    } catch (error) {
      logger.error('Logout error:', error);
      return res.status(500).json({ message: 'Server error during logout' });
    }
  },

  async updatePassword(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { currentPassword, newPassword } = req.body as UpdatePasswordBody;
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      return res.json({ message: 'Password updated successfully' });
    } catch (error) {
      logger.error('Password update error:', error);
      return res.status(500).json({ message: 'Server error during password update' });
    }
  },
};

export default authController;