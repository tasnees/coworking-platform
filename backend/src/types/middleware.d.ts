import { Request, Response, NextFunction } from 'express';
import { IUserDocument } from '../models/User';

export interface AuthRequest extends Request {
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
}

export type RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => void;

export type AsyncRequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

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
