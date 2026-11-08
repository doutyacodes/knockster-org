import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

// Fail fast rather than falling back to a hardcoded default.
//
// This secret does double duty: it signs every session token AND it is the key
// in the guard QR signature (sha256(guardId-orgId-JWT_SECRET), see
// app/api/mobile-api/security/qr). With a known fallback value, anyone could
// mint a valid guard QR and clear an L3/L4 gate, and forge session tokens for
// any role. A deployment missing this variable must not start.
export const JWT_SECRET = requireEnv("JWT_SECRET");

export interface JWTPayload {
  id: string;
  email?: string;
  username?: string;
  phone?: string;
  role: 'superadmin' | 'orgadmin' | 'guard' | 'guest';
  organizationNodeId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export interface AuthResult {
  success: boolean;
  payload?: JWTPayload;
}

export async function authenticateRequest(request: Request): Promise<AuthResult> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { success: false };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { success: false };
  }

  return { success: true, payload };
}
