import { Hono } from 'hono';
import { SignJWT, jwtVerify } from 'jose';
import { config } from './env';
import { getDB } from './db';

export interface AuthPayload {
  sub: number;
  username: string;
  role: 'admin' | 'learner';
}

const COOKIE = 'sid';
const secret = new TextEncoder().encode(config.authSecret);

export async function hashPassword(pw: string): Promise<string> {
  return await Bun.password.hash(pw, 'bcrypt');
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(pw, hash);
}

export async function issueToken(payload: AuthPayload): Promise<string> {
  return await new SignJWT({ username: payload.username, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: Number(payload.sub),
      username: payload.username as string,
      role: payload.role as 'admin' | 'learner',
    };
  } catch {
    return null;
  }
}

function cookieOpts(maxAge = 2592000): string {
  return [`${COOKIE}=`, 'HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', `Max-Age=${maxAge}`].join('; ');
}

export function setAuthCookie(c: any, token: string): void {
  c.header('Set-Cookie', `${COOKIE}=${token}; ${cookieOpts()}`);
}

export function clearAuthCookie(c: any): void {
  c.header('Set-Cookie', `${COOKIE}=; ${cookieOpts(0)}`);
}

export function getTokenFromCookie(c: any): string | null {
  const header = c.req.header('Cookie') ?? '';
  const m = header.match(/(?:^|;\s*)sid=([^;]+)/);
  return m ? m[1] : null;
}

export async function sessionMiddleware(c: any, next: any) {
  const token = getTokenFromCookie(c);
  if (token) {
    const payload = await verifyToken(token);
    if (payload) c.set('user', payload);
  }
  await next();
}

export function requireAuth(roles?: Array<'admin' | 'learner'>) {
  return async (c: any, next: any) => {
    const user = c.get('user') as AuthPayload | undefined;
    if (!user) return c.json({ error: 'unauthorized' }, 401);
    if (roles && !roles.includes(user.role)) return c.json({ error: 'forbidden' }, 403);
    await next();
  };
}

export const authRoutes = new Hono();

authRoutes.post('/login', async (c) => {
  const { username, password } = await c.req.json().catch(() => ({}));
  if (!username || !password) return c.json({ error: 'username and password required' }, 400);
  const db = getDB();
  const row = db.query('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return c.json({ error: 'invalid credentials' }, 401);
  }
  const token = await issueToken({ sub: row.id, username: row.username, role: row.role });
  setAuthCookie(c, token);
  return c.json({ user: { id: row.id, username: row.username, role: row.role } });
});

authRoutes.post('/logout', (c) => {
  clearAuthCookie(c);
  return c.json({ ok: true });
});

authRoutes.get('/me', sessionMiddleware, (c: any) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'unauthorized' }, 401);
  return c.json({ user });
});
