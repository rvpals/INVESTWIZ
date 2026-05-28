import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

type AuthEnv = { Variables: { auth: { userId: string } } };

export const marketRoutes = new Hono<AuthEnv>();

marketRoutes.use('*', authMiddleware);

marketRoutes.get('/quotes', async (c) => {
  const symbols = c.req.query('symbols')?.split(',').filter(Boolean) || [];

  if (symbols.length === 0) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'No symbols provided' } }, 400);
  }

  // TODO: Implement Yahoo Finance integration
  const quotes = symbols.map((symbol) => ({
    symbol,
    name: symbol,
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    marketCap: 0,
    updatedAt: new Date().toISOString(),
  }));

  return c.json({ quotes });
});

marketRoutes.get('/history/:symbol', async (c) => {
  const symbol = c.req.param('symbol');
  void c.req.query('range');
  void c.req.query('interval');

  // TODO: Implement Yahoo Finance historical data
  return c.json({ symbol, data: [] });
});

marketRoutes.get('/search', async (c) => {
  void c.req.query('q');

  // TODO: Implement Yahoo Finance search
  return c.json({ results: [] });
});

marketRoutes.get('/news', async (c) => {
  void c.req.query('symbol');

  // TODO: Implement Yahoo Finance news
  return c.json({ news: [] });
});
