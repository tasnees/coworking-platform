import jwt from 'jsonwebtoken';
import { logger } from './logger';
import type { IUserDocument } from '../models/User';

// Define UserRole type locally to avoid import issues
export type UserRole = 'MEMBER' | 'STAFF' | 'ADMIN';

// Re-export for backward compatibility
export type { IUserDocument } from '../models/User';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface TokenUser {
  _id: string;
  email: string;
  role: UserRole;
  tokenVersion?: number;
}

export function generateToken(user: IUserDocument | TokenUser): { accessToken: string; refreshToken: string } {
  // Ensure _id is properly handled whether it's an ObjectId or string
  const userId = (() => {
    const id = user._id;
    // Check if it's a Mongoose ObjectId
    if (id && typeof id === 'object' && 'toString' in id) {
      return id.toString();
    }
    // If it's already a string, return it directly
    if (typeof id === 'string') {
      return id;
    }
    // Fallback for any other case
    return String(id);
  })();

  const payload: TokenPayload = {
    userId,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

  return { accessToken, refreshToken };
}

export function generateRefreshToken(user: IUserDocument | TokenUser): string {
  // Ensure _id is properly handled whether it's an ObjectId or string
  const userId = (() => {
    const id = user._id;
    // Check if it's a Mongoose ObjectId
    if (id && typeof id === 'object' && 'toString' in id) {
      return id.toString();
    }
    // If it's already a string, return it directly
    if (typeof id === 'string') {
      return id;
    }
    // Fallback for any other case
    return String(id);
  })();

  const payload: TokenPayload = {
    userId,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyToken(token: string, type: 'access' | 'refresh'): TokenPayload | null {
  try {
    const secret = type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (err) {
    logger.error(`JWT verification failed: ${err}`);
    return null;
  }
}