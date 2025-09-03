import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { IUserDocument } from '../models/User';

export interface AuthRequest extends ExpressRequest {
  user?: IUserDocument & {
    id: string;
    role: string;
    [key: string]: unknown;
  };
  token?: string;
  cookies: {
    refreshToken?: string;
    [key: string]: string | undefined;
  };
  headers: {
    [key: string]: string | string[] | undefined;
    authorization?: string;
    Authorization?: string;
  };
}

export type RequestHandler = (
  req: AuthRequest,
  res: ExpressResponse,
  next: NextFunction
) => Promise<void> | void;

export type AsyncRequestHandler = (
  req: AuthRequest,
  res: ExpressResponse,
  next: NextFunction
) => Promise<void>;

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument & {
        id: string;
        role: string;
        [key: string]: unknown;
      };
      token?: string;
    }
  }
}

export {};
