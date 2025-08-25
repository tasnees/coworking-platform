import { IUserDocument } from '../models/User';

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
      user?: IUserDocument;
    }

    interface Response {
      cookie(name: string, value: string, options?: CookieOptions): this;
      clearCookie(name: string, options?: Omit<CookieOptions, 'maxAge' | 'expires'>): this;
    }
  }
}
