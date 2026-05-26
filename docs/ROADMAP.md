# Roadmap

## Phase 1 — Foundation (MVP)

Core infrastructure and basic portfolio tracking.

- [ ] Project scaffolding (Vite, React, TypeScript, Tailwind, shadcn/ui)
- [ ] PWA setup (manifest, service worker, installability)
- [ ] Backend setup (Hono on Vercel, Turso connection)
- [ ] Database schema and migrations (users, portfolios, transactions, holdings)
- [ ] Authentication (register, login, logout, JWT refresh)
- [ ] Portfolio CRUD (create, rename, delete portfolios)
- [ ] Transaction entry (buy, sell, dividend, split)
- [ ] Holdings calculation from transactions
- [ ] Basic portfolio view (list of holdings with quantities and cost basis)
- [ ] Responsive mobile-first layout shell (nav, tabs, pages)

## Phase 2 — Live Data & Analytics

Market data integration and portfolio intelligence.

- [ ] Yahoo Finance integration (MarketDataProvider implementation)
- [ ] Live/delayed price display on holdings
- [ ] P&L calculation (unrealized, realized, total return)
- [ ] Portfolio performance chart (line chart, selectable time ranges)
- [ ] Asset allocation breakdown (pie/donut chart by sector, asset type, geography)
- [ ] Individual holding detail page (price history, transaction history)
- [ ] Search and add assets (symbol search with autocomplete)
- [ ] Multi-currency support (base currency per portfolio)
- [ ] Server-side price caching (reduce Yahoo Finance API calls)

## Phase 3 — Watchlists & Alerts

Monitoring and notification features.

- [ ] Watchlist CRUD (create multiple watchlists)
- [ ] Add/remove assets to watchlists
- [ ] Watchlist view with live prices and daily change
- [ ] Price alert configuration (above/below target price)
- [ ] Push notification setup (service worker + Notification API)
- [ ] Alert trigger engine (server-side price checking on schedule)
- [ ] Alert history log
- [ ] Daily portfolio summary notification (optional)

## Phase 4 — News & Research

Information feeds to inform decisions.

- [ ] News feed (general market news)
- [ ] Per-asset news (filtered by held/watched symbols)
- [ ] News source attribution and linking
- [ ] Basic asset fundamentals display (P/E, market cap, dividend yield)
- [ ] Earnings calendar for held assets
- [ ] Dividend calendar and projected income

## Phase 5 — Goals & Planning

Investment goal tracking and projections.

- [ ] Goal creation (target amount, target date, monthly contribution)
- [ ] Goal progress visualization (progress bar, projected vs actual)
- [ ] Retirement calculator (compound growth projections)
- [ ] "What-if" scenario modeling (adjust contributions, returns)
- [ ] Goal-to-portfolio linking (which portfolios fund which goals)
- [ ] Milestone notifications (50%, 75%, goal reached)

## Phase 6 — Polish & Advanced

Quality of life improvements and power features.

- [ ] Offline mutation queue with conflict resolution
- [ ] Data export (CSV, PDF reports)
- [ ] Data import (CSV transactions from brokers)
- [ ] Dark mode / theme customization
- [ ] Tablet-optimized layouts (side-by-side panels)
- [ ] Keyboard shortcuts (desktop)
- [ ] Portfolio comparison view
- [ ] Benchmark comparison (vs S&P 500, custom benchmark)
- [ ] Tax lot tracking (FIFO, LIFO, specific identification)
- [ ] Annual tax report generation

## Future Considerations

Ideas for later exploration (not committed):

- Multi-user sharing (view-only portfolio links)
- Social features (anonymous performance comparison)
- AI-powered insights ("your tech allocation is 60%, consider diversifying")
- Broker API integrations (auto-import transactions)
- Crypto wallet connection (read-only balance tracking)
- Real estate valuation integration (Zillow/Redfin estimates)
