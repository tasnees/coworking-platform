/* eslint-disable @typescript-eslint/no-namespace */
import { User } from '../models/User';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { Request, Response, NextFunction } from 'express-serve-static-core';

// Extend Express Request type with custom properties
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: string;
      [key: string]: unknown;
    };
    token?: string;
  }
}

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header or cookies
    let token: string | undefined;
    const authHeader = (req.headers.authorization || (req.headers as Record<string, string | string[] | undefined>).Authorization) as string | undefined;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.refreshToken) {
      token = req.cookies.refreshToken;
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required. No token provided.');
    }

    // Verify token
    const decoded = verifyToken(token, 'access');
    if (!decoded) {
      throw new ApiError(401, 'Invalid or expired token.');
    }

    // Get user from the token
    const user = await User.findById(decoded.userId).select('-password').lean();
    if (!user) {
      throw new ApiError(401, 'User not found.');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated.');
    }

    // Attach user and token to request object
    const { _id, role, ...userData } = user;
    req.user = { 
      id: _id.toString(), 
      role: role,
      ...userData
    };
    req.token = token;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    throw new ApiError(401, 'Authentication failed.');
  }
};

// Role-based middleware
export const requireRoles = (roles: string | string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      throw new ApiError(401, 'Authentication required.');
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(403, 'Insufficient permissions.');
    }

    next();
  };
};
