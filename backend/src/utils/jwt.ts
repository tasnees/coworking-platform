import jwt from 'jsonwebtoken';
import { Document, Types } from 'mongoose';
import { logger } from './logger';

// Define the user document interface
interface IUserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  role: string;
  comparePassword: (password: string) => Promise<boolean>;
  [key: string]: any;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(user: IUserDocument): { accessToken: string; refreshToken: string } {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

  return { accessToken, refreshToken };
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