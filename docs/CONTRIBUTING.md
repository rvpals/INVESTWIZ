# Contributing

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- A Turso account (free tier: https://turso.tech)

### First-Time Setup

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Create a Turso database
turso db create investwiz-dev
turso db tokens create investwiz-dev

# Add the URL and token to .env, plus a JWT_SECRET (any 32+ char string)

# Run migrations
pnpm db:migrate

# Seed development data (optional)
pnpm db:seed

# Start dev server
pnpm dev
```

## Development Workflow

### Branch Naming

```
feature/short-description    # New features
fix/short-description        # Bug fixes
refactor/short-description   # Code refactoring
docs/short-description       # Documentation updates
```

### Commit Messages

Use conventional commits:

```
feat: add watchlist drag-to-reorder
fix: correct P&L calculation for partial sells
refactor: extract market data caching layer
docs: update API endpoint documentation
chore: upgrade vite to 6.x
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm lint && pnpm typecheck && pnpm test`
4. Push and open a PR
5. PR title follows conventional commit format
6. Include a brief description of what and why

## Code Style

### TypeScript

- Strict mode enabled — no `any` types (use `unknown` if truly needed)
- Prefer `interface` over `type` for object shapes
- Use discriminated unions for state machines
- Export types from `src/types/` — don't scatter type definitions

### React Components

```typescript
// File: src/components/portfolio-card.tsx

interface PortfolioCardProps {
  portfolio: Portfolio;
  onSelect: (id: string) => void;
}

export function PortfolioCard({ portfolio, onSelect }: PortfolioCardProps) {
  // Component logic
}
```

- One component per file
- Named exports (no default exports)
- Props interface defined in the same file
- Hooks extracted when logic is reused across 2+ components

### API Routes

```typescript
// File: server/routes/portfolios.ts

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';

const app = new Hono();

const createPortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  currency: z.string().length(3),
});

app.post('/', authMiddleware, async (c) => {
  const body = createPortfolioSchema.parse(await c.req.json());
  // Handler logic
});

export default app;
```

- Every route validates input with Zod
- Auth middleware applied to all protected routes
- Return consistent response shapes

### Testing

```typescript
// File: tests/services/portfolio-calculator.test.ts

import { describe, it, expect } from 'vitest';
import { calculatePnL } from '@server/services/portfolio-calculator';

describe('calculatePnL', () => {
  it('calculates unrealized gain for long position', () => {
    // Arrange, Act, Assert
  });
});
```

- Test files mirror source structure in `tests/`
- Unit tests for services and utilities
- Integration tests for API routes (using Hono test client)
- Name tests descriptively — describe *what* and *when*

## Project Conventions

### File Organization

| What | Where |
|------|-------|
| Page components | `src/pages/` |
| Reusable UI components | `src/components/` |
| shadcn/ui primitives | `src/components/ui/` |
| Custom hooks | `src/hooks/` |
| API client functions | `src/services/` |
| Zustand stores | `src/stores/` |
| Type definitions | `src/types/` |
| API routes | `server/routes/` |
| Server middleware | `server/middleware/` |
| Business logic | `server/services/` |
| DB schema & queries | `server/db/` |

### Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `portfolio-card.tsx` |
| Components | PascalCase | `PortfolioCard` |
| Functions | camelCase | `calculatePnL` |
| Types | PascalCase | `Portfolio`, `Transaction` |
| DB tables | snake_case | `portfolio_holdings` |
| API routes | kebab-case | `/api/portfolio-holdings` |
| Environment vars | SCREAMING_SNAKE | `DATABASE_URL` |

### Import Order

```typescript
// 1. React/framework imports
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal modules (path aliases)
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

// 4. Relative imports (same feature)
import { PortfolioCard } from './portfolio-card';

// 5. Types (type-only imports)
import type { Portfolio } from '@/types';
```

## Adding a New Feature

1. **Types first** — Define the data shapes in `src/types/`
2. **Database** — Add migration if new tables/columns needed
3. **API route** — Implement the endpoint with Zod validation
4. **Service layer** — Business logic in `server/services/`
5. **Frontend service** — API client function in `src/services/`
6. **Hook** — TanStack Query hook in `src/hooks/`
7. **UI** — Page and components
8. **Tests** — Unit tests for logic, integration tests for API

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -i :5173  # Find the process
kill -9 <PID>  # Kill it
```

**Database connection failed:**
- Check `DATABASE_URL` format: `libsql://your-db-name-your-org.turso.io`
- Ensure auth token is valid: `turso db tokens create <db-name>`

**PWA not updating:**
- Hard refresh: Ctrl+Shift+R
- Clear service worker: DevTools → Application → Service Workers → Unregister
- In dev mode, SW is disabled by default
