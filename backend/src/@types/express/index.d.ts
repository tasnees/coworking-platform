import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction, RequestHandler as ExpressRequestHandler } from 'express';
import { Document, Types, Model } from 'mongoose';

export * from 'express';
export { Document, Types, Model } from 'mongoose';

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument & { tokenVersion: number };
      cookies: {
        refreshToken?: string;
        [key: string]: string | undefined;
      };
    }
  }
}

// Base user interface that matches the User model
// This interface should match your User model schema
export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  name?: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: 'member' | 'staff' | 'admin' | 'user' | 'manager';
  membershipType?: string;
  membershipStatus?: 'active' | 'inactive' | 'suspended';
  tokenVersion: number;
  isActive: boolean;
  lastLogin?: Date;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isEmailVerified: boolean;
  permissions?: string[];
  joinDate?: Date;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | Types.ObjectId;
  approvedAt?: Date;
  preferences?: {
    emailNotifications: boolean;
    securityAlerts: boolean;
    systemAlerts: boolean;
    twoFactorEnabled: boolean;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  matchPassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getResetPasswordToken(): string;
  save(): Promise<this>;
  [key: string]: any;
}

// Extended request with user and other custom properties
export interface AuthRequest extends ExpressRequest {
  user?: IUserDocument;
  cookies: {
    refreshToken?: string;
    [key: string]: string | undefined;
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
export type RequestHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>
> = ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>;

// User model type for type safety
export interface IUserModel extends Model<IUserDocument> {
  // Add any static methods here
  findByEmail(email: string): Promise<IUserDocument | null>;
}

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
