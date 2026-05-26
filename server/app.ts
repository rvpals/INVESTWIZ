import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { portfolioRoutes } from './routes/portfolios';
import { marketRoutes } from './routes/market';

const app = new Hono().basePath('/api');

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);

app.route('/auth', authRoutes);
app.route('/portfolios', portfolioRoutes);
app.route('/market', marketRoutes);

app.get('/health', (c) => c.json({ status: 'ok' }));

export { app };
