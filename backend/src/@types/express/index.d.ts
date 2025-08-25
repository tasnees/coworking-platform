import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import { Document, Types } from 'mongoose';

// Base user interface that can be extended by your actual User model
export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  role: 'member' | 'staff' | 'admin';
  [key: string]: any;
}

// Extended request with user and other custom properties
export interface AuthRequest extends ExpressRequest {
  user?: {
    id: string;
    role: string;
    [key: string]: any;
  };
  token?: string;
  resource?: any;
  isAdmin?: boolean;
  isStaff?: boolean;
  isOwner?: boolean;
  [key: string]: any;
}

// Re-export core types with our extensions
export interface Response extends ExpressResponse {}
export interface NextFunction extends ExpressNextFunction {}

// RequestHandler type that uses our extended Request
export type RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Cookie options interface
export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none' | boolean;
  maxAge?: number;
  path?: string;
  domain?: string;
  expires?: Date;
}

// Extend the Response interface
declare global {
  namespace Express {
    interface Response {
      cookie(name: string, value: string, options?: CookieOptions): this;
      clearCookie(name: string, options?: Omit<CookieOptions, 'maxAge' | 'expires'>): this;
    }
  }
}
