import { Request, Response, NextFunction } from 'express';
import { IUserDocument } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUserDocument & {
    id: string;
    role: string;
    [key: string]: unknown;
  };
  token?: string;
}

export type AsyncRequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => void;

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
