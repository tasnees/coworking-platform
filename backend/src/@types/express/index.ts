import { IUserDocument } from '../../models/User';

// Extend Express Request type
export interface AuthenticatedRequest extends Express.Request {
  user?: IUserDocument;
}

// Extend Express Response type
export interface CustomResponse extends Express.Response {
  cookie(name: string, value: string, options?: CookieOptions): this;
  clearCookie(name: string, options?: Omit<CookieOptions, 'maxAge' | 'expires'>): this;
}

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none' | boolean;
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
}

export {};
