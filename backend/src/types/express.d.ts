import { IUser } from '../models/User';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

// Cookie options type
export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none' | boolean;
  maxAge?: number;
  path?: string;
  domain?: string;
  expires?: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
      resource?: any;
      isAdmin?: boolean;
      [key: string]: any;  // Allow additional properties
    }

    interface Response {
      cookie(name: string, value: string, options?: CookieOptions): this;
      clearCookie(name: string, options?: Omit<CookieOptions, 'maxAge' | 'expires'>): this;
    }
  }
}
