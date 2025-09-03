/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import type { IUserDocument } from '../models/User';

export interface TokenPayload extends JwtPayload {
  userId: string;
  tokenVersion: number;
  type?: string;
  iat: number;
  exp: number;
}

type DecodedToken = TokenPayload & JwtPayload;

// JWT sign options with proper typing
const getJwtOptions = (expiresIn: string | number): SignOptions => {
  const options: SignOptions = {
    algorithm: 'HS256',
    allowInsecureKeySizes: true
  };
  
  // Only add expiresIn if it's provided
  if (expiresIn) {
    // Convert string to number of seconds if it's a string with time unit
    if (typeof expiresIn === 'string') {
      const num = parseInt(expiresIn, 10);
      if (!isNaN(num)) {
        if (expiresIn.endsWith('d')) {
          options.expiresIn = num * 24 * 60 * 60; // days to seconds
        } else if (expiresIn.endsWith('h')) {
          options.expiresIn = num * 60 * 60; // hours to seconds
        } else if (expiresIn.endsWith('m')) {
          options.expiresIn = num * 60; // minutes to seconds
        } else if (expiresIn.endsWith('s')) {
          options.expiresIn = num; // already in seconds
        } else {
          // Default to seconds if no unit specified
          options.expiresIn = num;
        }
      } else {
        options.expiresIn = expiresIn as any; // Fallback to string if parsing fails
      }
    } else {
      options.expiresIn = expiresIn; // Already a number
    }
  }
  
  return options;
};

export const generateToken = (user: IUserDocument): string => {
  if (!user._id) {
    throw new Error('User ID is required');
  }
  
  const userId = user._id.toString();
  const tokenVersion = user.tokenVersion || 0;
  const expiresIn = process.env.JWT_EXPIRE || '1d';
  const iat = Math.floor(Date.now() / 1000);
  
  // Calculate expiration time
  let exp: number;
  if (typeof expiresIn === 'string' && expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn, 10);
    exp = iat + (days * 24 * 60 * 60);
  } else if (typeof expiresIn === 'number') {
    exp = iat + expiresIn;
  } else {
    exp = iat + (24 * 60 * 60); // Default to 1 day
  }
  
  const payload: TokenPayload = {
    userId,
    tokenVersion,
    iat,
    exp
  };
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, secret, getJwtOptions(expiresIn));
};

export const generateRefreshToken = (user: IUserDocument): string => {
  if (!user._id) {
    throw new Error('User ID is required');
  }
  
  const userId = user._id.toString();
  const tokenVersion = user.tokenVersion || 0;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRE || '7d';
  const iat = Math.floor(Date.now() / 1000);
  
  // Calculate expiration time
  let exp: number;
  if (typeof expiresIn === 'string' && expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn, 10);
    exp = iat + (days * 24 * 60 * 60);
  } else if (typeof expiresIn === 'number') {
    exp = iat + expiresIn;
  } else {
    exp = iat + (7 * 24 * 60 * 60); // Default to 7 days
  }
  
  const payload: TokenPayload = {
    userId,
    tokenVersion,
    type: 'refresh',
    iat,
    exp
  };
  
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, secret, getJwtOptions(expiresIn));
};

export const verifyToken = (token: string, type: 'access' | 'refresh' = 'access'): DecodedToken | null => {
  const secret = type === 'access' 
    ? process.env.JWT_SECRET 
    : process.env.REFRESH_TOKEN_SECRET;
    
  if (!secret) {
    throw new Error(`${type === 'access' ? 'JWT_SECRET' : 'REFRESH_TOKEN_SECRET'} is not defined in environment variables`);
  }
  
  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    
    // Check required fields
    if (!decoded.userId || decoded.tokenVersion === undefined) {
      return null;
    }
    
    // Check token type if specified
    if (type === 'refresh' && decoded.type !== 'refresh') {
      return null;
    }
    
    // Check expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
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