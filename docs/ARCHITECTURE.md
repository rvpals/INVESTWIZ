# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Client (PWA)                         │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐ │
│  │  React  │  │  Zustand  │  │ TanStack│  │  Service  │ │
│  │  Pages  │  │  Stores   │  │  Query  │  │  Worker   │ │
│  └────┬────┘  └─────┬────┘  └────┬────┘  └─────┬────┘ │
│       └──────────────┴────────────┴─────────────┘       │
└─────────────────────────────┬───────────────────────────┘
                              │ HTTPS (REST JSON)
┌─────────────────────────────┴───────────────────────────┐
│                 Vercel Serverless Functions               │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  Hono Framework                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │   │
│  │  │  Routes  │  │Middleware│  │   Services    │  │   │
│  │  │  /api/*  │  │Auth/CORS │  │ Market/Calc   │  │   │
│  │  └────┬─────┘  └──────────┘  └───────┬───────┘  │   │
│  └───────┴───────────────────────────────┴──────────┘   │
└──────────┬───────────────────────────────┬──────────────┘
           │                               │
    ┌──────┴──────┐                ┌───────┴───────┐
    │    Turso    │                │ Yahoo Finance │
    │   (libSQL)  │                │     API       │
    └─────────────┘                └───────────────┘
```

## Layer Responsibilities

### Frontend (PWA)

| Layer | Responsibility |
|-------|---------------|
| Pages | Route-level containers, data fetching orchestration |
| Components | Reusable UI building blocks (shadcn/ui based) |
| Hooks | Shared logic (usePortfolio, useMarketData, useAuth) |
| Stores (Zustand) | Client-side state: UI preferences, offline queue, auth state |
| TanStack Query | Server state: caching, background refetch, optimistic updates |
| Service Worker | Offline caching, push notifications, background sync |

### Backend (Hono on Vercel)

| Layer | Responsibility |
|-------|---------------|
| Routes | HTTP endpoint definitions, request/response handling |
| Middleware | Auth verification, CORS, rate limiting, request validation |
| Services | Business logic: portfolio calculations, market data fetching |
| DB Layer | Schema definitions, migrations, typed queries (Drizzle ORM) |

### Database (Turso/libSQL)

- SQLite-compatible relational database
- Edge replicas for low-latency global reads
- Primary region writes, replicated reads
- Forward-only migrations managed by Drizzle Kit

## Data Flow

### Portfolio View (Read)

```
User opens app
  → Service Worker serves cached shell (instant load)
  → TanStack Query checks cache freshness
  → If stale: GET /api/portfolios → Hono route
    → Auth middleware validates JWT
    → Portfolio service queries Turso
    → Returns portfolio + holdings data
  → React renders with cached-then-fresh pattern
```

### Add Transaction (Write)

```
User submits buy/sell form
  → Zod validates input client-side
  → If online: POST /api/transactions → Hono route
    → Auth middleware validates JWT
    → Zod validates input server-side
    → Transaction service writes to Turso
    → Returns updated portfolio state
    → TanStack Query invalidates portfolio cache
  → If offline:
    → Mutation queued in IndexedDB
    → Service Worker syncs when back online
```

### Live Price Updates

```
TanStack Query refetch interval (configurable)
  → GET /api/market/prices?symbols=AAPL,BTC-USD,...
  → Hono route → Market service
    → Yahoo Finance API (with caching layer)
    → Returns current prices
  → UI updates with new prices
  → P&L recalculated client-side
```

## Authentication Flow

```
Registration:
  User submits email + password
    → POST /api/auth/register
    → Server hashes password with argon2id (salt auto-generated)
    → Stores user record in Turso
    → Returns JWT in HTTP-only cookie

Login:
  User submits email + password
    → POST /api/auth/login
    → Server retrieves user by email
    → Verifies password against argon2id hash
    → Returns JWT in HTTP-only cookie (httpOnly, secure, sameSite=strict)

Authenticated requests:
  Every API call includes cookie automatically
    → Auth middleware extracts + verifies JWT
    → Attaches user context to request
    → Route handler accesses user via c.get('user')

Token refresh:
  JWT has short expiry (15 min)
  Refresh token stored in DB with longer expiry (7 days)
  Client auto-refreshes via /api/auth/refresh
```

## PWA Architecture

### Caching Strategy

| Resource | Strategy | Rationale |
|----------|----------|-----------|
| App shell (HTML, JS, CSS) | Cache-first | Instant loads, update in background |
| API responses | Network-first | Fresh data preferred, fallback to cache |
| Market data | Stale-while-revalidate | Show last known price, update async |
| Static assets (icons, fonts) | Cache-first | Rarely change |
| User images | Cache-first with expiry | Bounded storage |

### Offline Capabilities

- View all portfolios and holdings (cached data)
- View last-known prices and P&L
- Add transactions (queued for sync)
- View watchlists and alerts configuration
- Cannot: fetch live prices, receive push notifications

## Key Abstractions

### MarketDataProvider Interface

```typescript
interface MarketDataProvider {
  getQuotes(symbols: string[]): Promise<Quote[]>;
  getHistorical(symbol: string, range: TimeRange): Promise<OHLCV[]>;
  search(query: string): Promise<SearchResult[]>;
  getNews(symbol?: string): Promise<NewsItem[]>;
}
```

This abstraction allows swapping Yahoo Finance for another provider (Polygon, Alpha Vantage) without changing business logic.

### Portfolio Calculator

```typescript
interface PortfolioCalculator {
  calculateHoldings(transactions: Transaction[]): Holding[];
  calculatePnL(holdings: Holding[], prices: Quote[]): PnLResult;
  calculateAllocation(holdings: Holding[]): AllocationBreakdown;
  calculatePerformance(holdings: Holding[], history: OHLCV[][]): PerformanceMetrics;
}
```

Pure functions — no side effects, easily testable.

## Security Considerations

- Passwords hashed with argon2id (memory-hard, GPU-resistant)
- JWT tokens in HTTP-only cookies (not accessible via JS — XSS-safe)
- CORS restricted to known origins
- All inputs validated with Zod (server-side, always)
- Rate limiting on auth endpoints (prevent brute force)
- No sensitive data in service worker cache
- CSP headers configured for production

## Scalability Notes

- Turso handles read scaling via edge replicas automatically
- Vercel serverless scales horizontally per-request
- Yahoo Finance rate limits managed via server-side caching (Redis or in-memory LRU)
- Service worker reduces API load by caching aggressively on client
- No WebSocket dependency — polling with configurable intervals keeps infra simple
