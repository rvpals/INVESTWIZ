# INVESTWIZ — Project Instructions

## Overview

INVESTWIZ is a full-featured PWA portfolio tracker for the general public. It supports multi-asset classes (stocks, crypto, ETFs, bonds, mutual funds, real estate) with live market data, analytics, alerts, and goal tracking.

## Tech Stack

- **Frontend:** Vite + React 18 + TypeScript
- **PWA:** vite-plugin-pwa (Workbox under the hood)
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Backend:** Hono framework on Vercel Serverless Functions
- **Database:** Turso (libSQL — SQLite-compatible, edge-replicated)
- **Market Data:** Yahoo Finance (unofficial), abstracted behind a service layer
- **Auth:** Local password hashing (argon2/bcrypt) + JWT tokens — no third-party auth providers
- **Deployment:** Vercel (monorepo: frontend + API in one project)

## Project Structure

```
INVESTWIZ/
├── src/                    # Frontend source
│   ├── components/         # React components (shadcn/ui based)
│   │   └── ui/            # shadcn/ui primitives
│   ├── pages/             # Route-level page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities, constants, helpers
│   ├── services/          # API client, data fetching logic
│   ├── stores/            # State management (zustand)
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global styles, Tailwind config
├── server/                 # Backend source
│   ├── routes/            # Hono API route handlers
│   ├── middleware/        # Auth, CORS, rate-limiting middleware
│   ├── services/          # Business logic (market data, calculations)
│   ├── db/                # Database schema, migrations, queries
│   └── utils/             # Server-side utilities
├── public/                 # Static assets, PWA manifest, icons
├── docs/                   # Documentation files
├── tests/                  # Test files (Vitest)
└── ...config files
```

## Coding Conventions

- **Language:** TypeScript everywhere (strict mode enabled)
- **Formatting:** Prettier with default config
- **Linting:** ESLint with @typescript-eslint
- **Imports:** Use path aliases (`@/` for `src/`, `@server/` for `server/`)
- **Components:** Functional components with hooks, no class components
- **State:** Zustand for global state, React state for local UI state
- **API calls:** Use TanStack Query (React Query) for server state
- **Naming:**
  - Files: kebab-case (`portfolio-card.tsx`)
  - Components: PascalCase (`PortfolioCard`)
  - Functions/variables: camelCase
  - Types/interfaces: PascalCase with no `I` prefix
  - Database tables: snake_case
  - API routes: kebab-case (`/api/portfolio-holdings`)

## Commands

```bash
# Development
pnpm dev              # Start Vite dev server + API
pnpm dev:api          # Start only the API server

# Building
pnpm build            # Build frontend + API for production
pnpm preview          # Preview production build locally

# Testing
pnpm test             # Run Vitest tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report

# Code Quality
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm format           # Prettier format
pnpm typecheck        # TypeScript type checking

# Database
pnpm db:migrate       # Run pending migrations
pnpm db:seed          # Seed development data
pnpm db:studio        # Open Turso/Drizzle studio
```

## Key Design Decisions

1. **Offline-first PWA:** Service worker caches app shell and recent data. Users can view portfolios offline; mutations queue and sync when back online.
2. **Local auth only:** Passwords hashed with argon2id, sessions managed via HTTP-only JWT cookies. No OAuth, no third-party auth services.
3. **Market data abstraction:** Yahoo Finance is behind a `MarketDataProvider` interface so providers can be swapped without touching business logic.
4. **Mobile-first responsive:** All layouts designed mobile-first, progressively enhanced for tablet and desktop.
5. **Edge-deployed DB:** Turso provides SQLite semantics with edge replicas for low-latency reads globally.

## Environment Variables

```
# Required
DATABASE_URL=         # Turso database URL
DATABASE_AUTH_TOKEN=  # Turso auth token
JWT_SECRET=           # Secret key for JWT signing (min 32 chars)

# Optional
VITE_API_URL=         # API base URL (defaults to /api in production)
```

## Important Notes

- Never commit `.env` files
- Always run `pnpm typecheck` before committing
- PWA manifest and service worker config live in `vite.config.ts`
- All API routes must validate input with Zod schemas
- Database migrations are forward-only (no down migrations in production)
