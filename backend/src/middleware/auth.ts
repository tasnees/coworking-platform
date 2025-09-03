// Re-export the new auth middleware
export { authMiddleware as default, requireRoles } from './auth_new';

// Re-export the extended Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: string;
      [key: string]: unknown;
    };
    token?: string;
  }
}

export type AuthRequest = Request;
