type NextFunction = (err?: Error) => void;

type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;

interface Request {
  user?: {
    id: string;
    role: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface Response {
  [key: string]: unknown;
}

class ForbiddenError extends Error {
  status = 403;
  
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export const adminMiddleware: RequestHandler = (req, res, next) => {
  if (!req.user?.role || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};
