import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Define a type that includes the IP property from the request
interface RequestWithIp extends Request {
  ip: string;
}

// Extend the Error type to include status code
interface ErrorWithStatus extends Error {
  status?: number;
}

// Type for the next function with error handling
type NextFunction = (err?: ErrorWithStatus) => void;

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request): string => {
    // Ensure we always return a string, defaulting to 'unknown' if IP is not available
    return (req as RequestWithIp).ip || 'unknown';
  },
  handler: (req: Request, _res: Response, next: NextFunction) => {
    const ip = (req as RequestWithIp).ip || 'unknown';
    const error = new Error(`Rate limit exceeded for IP: ${ip}`) as ErrorWithStatus;
    error.status = 429;
    next(error);
  },
});

// More aggressive rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    // Ensure we always return a string, defaulting to 'unknown' if IP is not available
    return (req as RequestWithIp).ip || 'unknown';
  },
  handler: (req: Request, _res: Response, next: NextFunction) => {
    const ip = (req as RequestWithIp).ip || 'unknown';
    const error = new Error(`Too many login attempts from IP: ${ip}`) as ErrorWithStatus;
    error.status = 429;
    next(error);
  },
});

export { apiLimiter, authLimiter };
