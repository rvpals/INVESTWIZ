# INVESTWIZ

A full-featured Progressive Web App (PWA) portfolio tracker. Track stocks, crypto, ETFs, bonds, mutual funds, and real estate — all from your phone, tablet, or desktop.

## Features

- **Multi-asset portfolio tracking** — Stocks, crypto, ETFs, bonds, mutual funds, real estate
- **Live market data** — Real-time and delayed price updates
- **Analytics dashboard** — P&L, allocation breakdowns, performance charts
- **Watchlists** — Monitor assets you're interested in
- **Price alerts** — Push notifications when prices hit your targets
- **News feeds** — Curated news per asset
- **Goal tracking** — Set and track investment goals (retirement, milestones)
- **Offline-first** — Works without internet, syncs when reconnected
- **Mobile-optimized** — Designed for phones and tablets first

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- A [Turso](https://turso.tech/) database (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/investwiz.git
cd investwiz

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Turso database URL |
| `DATABASE_AUTH_TOKEN` | Yes | Turso authentication token |
| `JWT_SECRET` | Yes | Secret for JWT signing (min 32 characters) |
| `VITE_API_URL` | No | API base URL (defaults to `/api`) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| PWA | vite-plugin-pwa (Workbox) |
| UI | Tailwind CSS + shadcn/ui |
| State | Zustand + TanStack Query |
| Backend | Hono (Vercel Serverless) |
| Database | Turso (libSQL/SQLite) |
| Auth | Argon2id hashing + JWT |
| Market Data | Yahoo Finance (abstracted) |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (frontend + API) |
| `pnpm build` | Production build |
| `pnpm test` | Run tests |
| `pnpm lint` | Lint code |
| `pnpm typecheck` | Type check |
| `pnpm db:migrate` | Run migrations |

## Deployment

This project is configured for **Vercel** deployment:

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy — Vercel handles the build and serverless function setup automatically

The PWA is also installable as a standalone app on mobile devices.

## Project Structure

```
src/           → React frontend (pages, components, hooks, stores)
server/        → Hono API backend (routes, middleware, services, db)
public/        → Static assets and PWA manifest
tests/         → Test files
docs/          → Project documentation
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.

## License

MIT
