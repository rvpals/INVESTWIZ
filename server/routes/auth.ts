import { Hono } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, refreshTokens } from '../db/schema';
import { hashPassword, verifyPassword } from '../utils/password';
import { createAccessToken, createRefreshToken, verifyToken } from '../utils/jwt';
import { generateId } from '../utils/id';

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRoutes = new Hono();

authRoutes.post('/register', async (c) => {
  const body = registerSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: body.error.flatten().fieldErrors } }, 422);
  }

  const { name, email, password } = body.data;

  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return c.json({ error: { code: 'CONFLICT', message: 'Email already registered' } }, 409);
  }

  const id = generateId('usr');
  const passwordHash = await hashPassword(password);

  await db.insert(users).values({ id, email, name, passwordHash });

  const accessToken = await createAccessToken(id);
  const refreshToken = await createRefreshToken(id);
  const refreshTokenHash = await hashPassword(refreshToken);

  await db.insert(refreshTokens).values({
    id: generateId('rt'),
    userId: id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  setCookie(c, 'token', accessToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 900, path: '/' });
  setCookie(c, 'refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 604800, path: '/' });

  return c.json({ user: { id, email, name, createdAt: new Date().toISOString() } }, 201);
});

authRoutes.post('/login', async (c) => {
  const body = loginSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } }, 422);
  }

  const { email, password } = body.data;

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } }, 401);
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } }, 401);
  }

  const accessToken = await createAccessToken(user.id);
  const refreshToken = await createRefreshToken(user.id);
  const refreshTokenHash = await hashPassword(refreshToken);

  await db.insert(refreshTokens).values({
    id: generateId('rt'),
    userId: user.id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  setCookie(c, 'token', accessToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 900, path: '/' });
  setCookie(c, 'refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 604800, path: '/' });

  return c.json({ user: { id: user.id, email: user.email, name: user.name } });
});

authRoutes.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, 'refresh_token');
  if (!refreshToken) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token' } }, 401);
  }

  try {
    const { payload } = await verifyToken(refreshToken);
    const userId = payload.sub as string;

    const accessToken = await createAccessToken(userId);
    setCookie(c, 'token', accessToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 900, path: '/' });

    return c.json({ success: true });
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } }, 401);
  }
});

authRoutes.post('/logout', async (c) => {
  deleteCookie(c, 'token', { path: '/' });
  deleteCookie(c, 'refresh_token', { path: '/' });
  return c.json({ success: true });
});
