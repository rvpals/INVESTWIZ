import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { portfolios, transactions, holdings } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { generateId } from '../utils/id';

export const portfolioRoutes = new Hono();

portfolioRoutes.use('*', authMiddleware);

const createPortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  currency: z.string().length(3).default('USD'),
});

portfolioRoutes.get('/', async (c) => {
  const { userId } = c.get('auth');

  const userPortfolios = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.userId, userId));

  return c.json({ portfolios: userPortfolios });
});

portfolioRoutes.post('/', async (c) => {
  const { userId } = c.get('auth');
  const body = createPortfolioSchema.safeParse(await c.req.json());

  if (!body.success) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: body.error.flatten().fieldErrors } }, 422);
  }

  const id = generateId('ptf');
  const portfolio = {
    id,
    userId,
    name: body.data.name,
    currency: body.data.currency,
  };

  await db.insert(portfolios).values(portfolio);

  return c.json({ portfolio: { ...portfolio, createdAt: new Date().toISOString() } }, 201);
});

portfolioRoutes.get('/:id', async (c) => {
  const { userId } = c.get('auth');
  const portfolioId = c.req.param('id');

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
    .get();

  if (!portfolio) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Portfolio not found' } }, 404);
  }

  const portfolioHoldings = await db
    .select()
    .from(holdings)
    .where(eq(holdings.portfolioId, portfolioId));

  return c.json({ portfolio: { ...portfolio, holdings: portfolioHoldings } });
});

portfolioRoutes.patch('/:id', async (c) => {
  const { userId } = c.get('auth');
  const portfolioId = c.req.param('id');
  const body = await c.req.json();

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
    .get();

  if (!portfolio) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Portfolio not found' } }, 404);
  }

  await db
    .update(portfolios)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(portfolios.id, portfolioId));

  return c.json({ portfolio: { ...portfolio, ...body } });
});

portfolioRoutes.delete('/:id', async (c) => {
  const { userId } = c.get('auth');
  const portfolioId = c.req.param('id');

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
    .get();

  if (!portfolio) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Portfolio not found' } }, 404);
  }

  await db.delete(portfolios).where(eq(portfolios.id, portfolioId));

  return c.body(null, 204);
});

const createTransactionSchema = z.object({
  symbol: z.string().min(1).max(20),
  type: z.enum(['buy', 'sell', 'dividend', 'split', 'transfer_in', 'transfer_out']),
  quantity: z.number().positive(),
  price: z.number().min(0),
  fees: z.number().min(0).default(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).optional(),
});

portfolioRoutes.get('/:id/transactions', async (c) => {
  const { userId } = c.get('auth');
  const portfolioId = c.req.param('id');

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
    .get();

  if (!portfolio) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Portfolio not found' } }, 404);
  }

  const portfolioTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.portfolioId, portfolioId));

  return c.json({ transactions: portfolioTransactions });
});

portfolioRoutes.post('/:id/transactions', async (c) => {
  const { userId } = c.get('auth');
  const portfolioId = c.req.param('id');

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
    .get();

  if (!portfolio) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Portfolio not found' } }, 404);
  }

  const body = createTransactionSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: body.error.flatten().fieldErrors } }, 422);
  }

  const id = generateId('txn');
  const transaction = { id, portfolioId, ...body.data };

  await db.insert(transactions).values(transaction);

  return c.json({ transaction: { ...transaction, createdAt: new Date().toISOString() } }, 201);
});
