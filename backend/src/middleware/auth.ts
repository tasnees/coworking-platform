import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      };
      token?: string;
      token = authHeader[0];
    } else {
      token = authHeader;
    }
  }
  
  // Extract token from "Bearer TOKEN"
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7);
  } else {
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
  const processToken = async (): Promise<void> => {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        res.status(500).json({
          success: false,
          message: 'Server configuration error'
        });
        return;
      }

      const decoded = jwt.verify(token!, secret) as JwtPayload;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  };

  processToken().catch(() => {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  });
};

// Base interface for AuthRequest
export interface AuthRequestBase {
  user?: IUserDocument;
  status: (code: number) => {
    json: (data: Record<string, unknown> | { success: boolean; error?: string; message?: string; data?: unknown }) => void;
  };
  json: (data: Record<string, unknown> | { success: boolean; error?: string; message?: string; data?: unknown }) => void;
}

// Generic AuthRequest interface that extends Express's Request
export interface AuthRequest<ReqBody = unknown, ReqQuery = unknown, URLParams extends Record<string, string> = Record<string, string>> 
  extends ExpressRequestType<URLParams, unknown, ReqBody, ReqQuery>, AuthRequestBase {
  user?: IUserDocument;
  query: ReqQuery & {
    [key: string]: string | string[] | undefined;
    page?: string;
    limit?: string;
    role?: string;
    isActive?: string;
    search?: string;
  };
  params: URLParams & {
    [key: string]: string | undefined;
    id?: string;
  };
  body: ReqBody;
}