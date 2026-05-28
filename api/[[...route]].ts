import { handle } from 'hono/vercel';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { sqliteTable, text, real, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const runtime = 'nodejs';

// --- Schema ---
const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

const portfolios = sqliteTable('portfolios', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  currency: text('currency').notNull().default('USD'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  userIdIdx: index('idx_portfolios_user_id').on(table.userId),
}));

const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  portfolioId: text('portfolio_id').notNull(),
  symbol: text('symbol').notNull(),
  type: text('type').notNull(),
  quantity: real('quantity').notNull(),
  price: real('price').notNull(),
  fees: real('fees').notNull().default(0),
  date: text('date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  portfolioIdIdx: index('idx_transactions_portfolio_id').on(table.portfolioId),
  symbolIdx: index('idx_transactions_symbol').on(table.symbol),
}));

const holdings = sqliteTable('holdings', {
  id: text('id').primaryKey(),
  portfolioId: text('portfolio_id').notNull(),
  symbol: text('symbol').notNull(),
  assetName: text('asset_name').notNull(),
  assetType: text('asset_type').notNull(),
  quantity: real('quantity').notNull(),
  avgCost: real('avg_cost').notNull(),
  totalCost: real('total_cost').notNull(),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// --- DB ---
const client = createClient({
  url: process.env.DATABASE_URL || '',
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});
const db = drizzle(client, { schema: { users, refreshTokens, portfolios, transactions, holdings } });

// --- Helpers ---
function generateId(prefix: string) {
  return `${prefix}_${nanoid(12)}`;
}

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-dev-secret-32-chars-min');
}

async function createAccessToken(userId: string) {
  return new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
}

async function createRefreshToken(userId: string) {
  return new jose.SignJWT({ sub: userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

// --- App ---
const app = new Hono().basePath('/api');

app.use('*', cors({ origin: (origin) => origin || '*', credentials: true }));

app.onError((err, c) => {
  console.error('API Error:', err.message, err.stack);
  return c.json({ error: { code: 'INTERNAL_ERROR', message: err.message } }, 500);
});

// Health (no DB call — confirms routing works)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    dbUrl: process.env.DATABASE_URL ? 'set' : 'missing',
    dbToken: process.env.DATABASE_AUTH_TOKEN ? 'set' : 'missing',
    jwt: process.env.JWT_SECRET ? 'set' : 'missing',
    time: new Date().toISOString(),
  });
});

// DB test endpoint
app.get('/health/db', async (c) => {
  try {
    const result = await db.select().from(users).limit(1);
    return c.json({ status: 'db_ok', userCount: result.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ status: 'db_error', error: message }, 500);
  }
});

// Auth
const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

app.post('/auth/register', async (c) => {
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
  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({ id, email, name, passwordHash });

  const accessToken = await createAccessToken(id);
  const refreshToken = await createRefreshToken(id);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await db.insert(refreshTokens).values({
    id: generateId('rt'),
    userId: id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  setCookie(c, 'token', accessToken, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 900, path: '/' });
  setCookie(c, 'refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 604800, path: '/' });

  return c.json({ user: { id, email, name, createdAt: new Date().toISOString() } }, 201);
});

app.post('/auth/login', async (c) => {
  const body = loginSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } }, 422);
  }

  const { email, password } = body.data;

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } }, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } }, 401);
  }

  const accessToken = await createAccessToken(user.id);
  const refreshToken = await createRefreshToken(user.id);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await db.insert(refreshTokens).values({
    id: generateId('rt'),
    userId: user.id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  setCookie(c, 'token', accessToken, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 900, path: '/' });
  setCookie(c, 'refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 604800, path: '/' });

  return c.json({ user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/auth/refresh', async (c) => {
  const token = getCookie(c, 'refresh_token');
  if (!token) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token' } }, 401);
  }
  try {
    const { payload } = await jose.jwtVerify(token, getSecret());
    const accessToken = await createAccessToken(payload.sub as string);
    setCookie(c, 'token', accessToken, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 900, path: '/' });
    return c.json({ success: true });
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } }, 401);
  }
});

app.post('/auth/logout', async (c) => {
  deleteCookie(c, 'token', { path: '/' });
  deleteCookie(c, 'refresh_token', { path: '/' });
  return c.json({ success: true });
});

// Portfolios (auth required)
app.get('/portfolios', async (c) => {
  const token = getCookie(c, 'token');
  if (!token) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } }, 401);

  try {
    const { payload } = await jose.jwtVerify(token, getSecret());
    const userId = payload.sub as string;
    const result = await db.select().from(portfolios).where(eq(portfolios.userId, userId));
    return c.json({ portfolios: result });
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, 401);
  }
});

app.post('/portfolios', async (c) => {
  const token = getCookie(c, 'token');
  if (!token) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } }, 401);

  try {
    const { payload } = await jose.jwtVerify(token, getSecret());
    const userId = payload.sub as string;
    const { name, currency } = await c.req.json();
    const id = generateId('ptf');
    await db.insert(portfolios).values({ id, userId, name, currency: currency || 'USD' });
    return c.json({ portfolio: { id, userId, name, currency: currency || 'USD', createdAt: new Date().toISOString() } }, 201);
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, 401);
  }
});

// Market (stubs)
app.get('/market/quotes', (c) => c.json({ quotes: [] }));
app.get('/market/search', (c) => c.json({ results: [] }));
app.get('/market/news', (c) => c.json({ news: [] }));

export default handle(app);
