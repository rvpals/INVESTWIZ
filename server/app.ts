import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { portfolioRoutes } from './routes/portfolios';
import { marketRoutes } from './routes/market';

const app = new Hono().basePath('/api');

app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    credentials: true,
  })
);

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    { error: { code: 'INTERNAL_ERROR', message: err.message || 'Internal server error' } },
    500
  );
});

app.route('/auth', authRoutes);
app.route('/portfolios', portfolioRoutes);
app.route('/market', marketRoutes);

app.get('/health', (c) => c.json({ status: 'ok' }));

export { app };
