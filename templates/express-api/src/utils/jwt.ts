import jwt from 'jsonwebtoken';
import { JWTPayload } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_JWT_SECRET';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
