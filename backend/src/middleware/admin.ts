import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    [key: string]: unknown;
  };
}

export class ForbiddenError extends Error {
  readonly status = 403;
  
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

type ExpressNextFunction = (err?: Error) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExpressResponse = any;

export const adminMiddleware = (req: AuthenticatedRequest, _res: ExpressResponse, next: ExpressNextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }
  next();
};
