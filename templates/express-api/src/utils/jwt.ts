import jwt from 'jsonwebtoken';
import { JWTPayload } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_JWT_SECRET';

export function generateToken(payload: JWTPayload): string {
  // Default 24 hours expiration
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
