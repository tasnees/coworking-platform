import { Request, Response } from 'express';

type NextFunction = (err?: Error) => void;

interface AuthenticatedUser {
  id: string;
  role: string;
  [key: string]: unknown;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export class ForbiddenError extends Error {
  readonly status = 403;
  
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export const adminMiddleware = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }
  next();
};
