import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AdminSessionModel, AdminUserModel } from '../db/models.ts';
import { isDatabaseConnected } from '../db/connection.ts';

export const SESSION_COOKIE_NAME = 'gka_admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours max
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours inactivity

export interface AuthenticatedAdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  sessionId?: string;
  csrfToken?: string;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function safeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function getSessionCookieOptions(req: Request) {
  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge: SESSION_TTL_MS,
  };
}

export function sanitizePlainText(input: unknown, maxLen = 5000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, maxLen);
}

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
});

export const setupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many setup attempts. Please wait 15 minutes before trying again.' },
});

export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages sent recently. Please try again in a few minutes.' },
});

export async function resolveOptionalAdmin(
  req: AuthenticatedAdminRequest
): Promise<boolean> {
  if (!isDatabaseConnected()) return false;
  const rawToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (!rawToken || typeof rawToken !== 'string') return false;

  const tokenHash = hashToken(rawToken);
  const session = await AdminSessionModel.findOne({ tokenHash });
  if (!session) return false;

  const now = Date.now();
  if (
    now > new Date(session.expiresAt).getTime() ||
    now - new Date(session.lastActiveAt).getTime() > INACTIVITY_TIMEOUT_MS
  ) {
    await AdminSessionModel.deleteOne({ _id: session._id });
    return false;
  }

  const admin = await AdminUserModel.findById(session.adminId).select('_id email name role');
  if (!admin) {
    await AdminSessionModel.deleteOne({ _id: session._id });
    return false;
  }

  session.lastActiveAt = new Date();
  await session.save();

  req.admin = {
    id: String(admin._id),
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
  req.sessionId = String(session._id);
  req.csrfToken = session.csrfToken;
  return true;
}

export async function requireAdminAuth(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!isDatabaseConnected()) {
      res.status(503).json({ error: 'Database connection is not active.' });
      return;
    }

    const ok = await resolveOptionalAdmin(req);
    if (!ok || !req.admin) {
      res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions(req));
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    next();
  } catch (err) {
    console.error('[Auth] Middleware error:', err);
    res.status(500).json({ error: 'Authentication verification failed.' });
  }
}

export function requireCsrf(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): void {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    next();
    return;
  }

  const headerToken = req.headers['x-csrf-token'];
  if (
    typeof headerToken !== 'string' ||
    !req.csrfToken ||
    !safeCompareStrings(headerToken, req.csrfToken)
  ) {
    res.status(403).json({ error: 'Invalid or missing CSRF security token.' });
    return;
  }

  next();
}
