import { sqliteTable, text, real, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const portfolios = sqliteTable('portfolios', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  currency: text('currency').notNull().default('USD'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_portfolios_user_id').on(table.userId),
]);

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  type: text('type').notNull(),
  quantity: real('quantity').notNull(),
  price: real('price').notNull(),
  fees: real('fees').notNull().default(0),
  date: text('date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_transactions_portfolio_id').on(table.portfolioId),
  index('idx_transactions_symbol').on(table.symbol),
  index('idx_transactions_date').on(table.date),
]);

export const holdings = sqliteTable('holdings', {
  id: text('id').primaryKey(),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  assetName: text('asset_name').notNull(),
  assetType: text('asset_type').notNull(),
  quantity: real('quantity').notNull(),
  avgCost: real('avg_cost').notNull(),
  totalCost: real('total_cost').notNull(),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_holdings_portfolio_id').on(table.portfolioId),
  index('idx_holdings_symbol').on(table.symbol),
  uniqueIndex('idx_holdings_portfolio_symbol').on(table.portfolioId, table.symbol),
]);

export const watchlists = sqliteTable('watchlists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_watchlists_user_id').on(table.userId),
]);

export const watchlistItems = sqliteTable('watchlist_items', {
  id: text('id').primaryKey(),
  watchlistId: text('watchlist_id').notNull().references(() => watchlists.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  addedAt: text('added_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  uniqueIndex('idx_watchlist_items_unique').on(table.watchlistId, table.symbol),
]);

export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  condition: text('condition').notNull(),
  targetPrice: real('target_price').notNull(),
  active: integer('active').notNull().default(1),
  triggeredAt: text('triggered_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_alerts_user_id').on(table.userId),
  index('idx_alerts_active_symbol').on(table.active, table.symbol),
]);

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  targetAmount: real('target_amount').notNull(),
  targetDate: text('target_date'),
  monthlyContribution: real('monthly_contribution'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_goals_user_id').on(table.userId),
]);

export const goalPortfolios = sqliteTable('goal_portfolios', {
  goalId: text('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
}, (table) => [
  uniqueIndex('idx_goal_portfolios_pk').on(table.goalId, table.portfolioId),
]);
