import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { IUser } from '../types/user.types';

export interface TokenPayload {
  userId: string;
  tokenVersion: number;
  type?: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

// Custom interface to handle JWT options typing issues
interface JWTSignOptions {
  expiresIn: string;
  algorithm: 'HS256';
}

// Parse time string (e.g. '1d', '24h') to seconds
const parseTimeToSeconds = (timeStr: string): number => {
  const value = parseInt(timeStr, 10);
  if (isNaN(value)) throw new Error(`Invalid time format: ${timeStr}`);
  
  if (timeStr.endsWith('d')) return value * 24 * 60 * 60;
  if (timeStr.endsWith('h')) return value * 60 * 60;
  if (timeStr.endsWith('m')) return value * 60;
  return value; // Assume seconds if no unit specified
};

export const generateToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion
  };
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  const expiresIn = process.env.JWT_EXPIRE || '1d';
  
  // Use custom interface to handle typing
  const options: JWTSignOptions = {
    expiresIn,
    algorithm: 'HS256'
  };
  
  return jwt.sign(payload, secret, options as jwt.SignOptions);
};

export const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion,
    type: 'refresh'
  };
  
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
  }
  
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRE || '7d';
  
  // Use custom interface to handle typing
  const options: JWTSignOptions = {
    expiresIn,
    algorithm: 'HS256'
  };
  
  return jwt.sign(payload, secret, options as jwt.SignOptions);
};

export const verifyToken = (token: string): DecodedToken => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    return jwt.verify(token, secret) as DecodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): DecodedToken => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
  }
  
  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const generateEmailVerificationToken = (): { token: string; expiresAt: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const expirationHours = parseInt(process.env.EMAIL_VERIFICATION_EXPIRE_HOURS || '24', 10);
  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
  
  return {
    token,
    expiresAt
  };
};

export const generatePasswordResetToken = (): { token: string; expiresAt: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const expirationMinutes = parseInt(process.env.PASSWORD_RESET_EXPIRE_MINUTES || '10', 10);
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
  
  return {
    token,
    expiresAt
  };
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

export const getTokenPayload = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
};