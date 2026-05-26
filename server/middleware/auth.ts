import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import * as jose from 'jose';

interface AuthContext {
  userId: string;
}

export const authMiddleware = createMiddleware<{ Variables: { auth: AuthContext } }>(
  async (c, next) => {
    const token = getCookie(c, 'token');

    if (!token) {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);

      c.set('auth', { userId: payload.sub as string });
      await next();
    } catch {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401);
    }
  }
);
