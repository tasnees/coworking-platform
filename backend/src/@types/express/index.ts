import { IUserDocument } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
    
    interface Response {
      cookie(name: string, value: string, options?: CookieOptions): this;
      clearCookie(name: string, options?: Omit<CookieOptions, 'maxAge' | 'expires'>): this;
    }
  }
}

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none' | boolean;
  maxAge?: number;
  path?: string;
  domain?: string;
  expires?: Date;
}

export {};
