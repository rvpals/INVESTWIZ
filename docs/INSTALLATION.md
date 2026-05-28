# Installation Guide

Complete setup instructions for running InvestWiz locally on Windows.

## Prerequisites

### 1. Node.js (v20+)

Download and install from https://nodejs.org/

Verify installation:
```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show 10.x.x or higher
```

### 2. pnpm (Package Manager)

Install via corepack (bundled with Node.js):
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Verify:
```bash
pnpm --version    # Should show 9.x.x or higher
```

### 3. Git

Download and install from https://git-scm.com/

Verify:
```bash
git --version
```

---

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rvpals/INVESTWIZ.git
cd INVESTWIZ
```

### 2. Install Dependencies

```bash
pnpm install
```

If prompted to approve builds (for native modules like argon2):
```bash
pnpm approve-builds argon2 esbuild
```

### 3. Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` with these values for local development:
```env
# Local file-based SQLite database (no cloud service needed)
DATABASE_URL=file:local.db

# Leave empty for local file database
DATABASE_AUTH_TOKEN=

# Any random string, minimum 32 characters
JWT_SECRET=my-local-dev-secret-key-change-in-production

# Optional (defaults to /api)
VITE_API_URL=/api
```

### 4. Create the Database

Run migrations to create all tables in the local SQLite file:
```bash
pnpm db:migrate
```

You should see:
```
Running migrations...
Migrations complete.
```

This creates a `local.db` file in the project root.

---

## Running the Application

### Option A: Using the batch file (Windows)

Double-click `START_APP.bat` in the project root. This opens two command windows:
- **API server** on http://localhost:3001
- **Frontend** on http://localhost:5173

### Option B: Manual start (two terminals)

**Terminal 1 — API server:**
```bash
pnpm dev:api
```

**Terminal 2 — Frontend:**
```bash
pnpm dev
```

### Access the App

Open http://localhost:5173 in your browser.

1. Click "Sign up" to create an account
2. Enter your name, email, and password (min 8 characters)
3. You'll be redirected to the dashboard

---

## Common Issues

### `pnpm: command not found`

Run `corepack enable` first, then `corepack prepare pnpm@latest --activate`.

### Port 5173 already in use

The Vite dev server will automatically try the next available port (5174, 5175, etc.). Check the terminal output for the actual URL.

### Port 3001 already in use

Kill the process using port 3001:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### `ERR_PNPM_IGNORED_BUILDS` during install

This is expected. Run:
```bash
pnpm approve-builds argon2 esbuild
```

### Database migration fails with `URL_INVALID`

Make sure your `.env` file exists and contains `DATABASE_URL=file:local.db`. The migration script requires `dotenv` to load environment variables.

### Frontend shows blank page / build errors

Clear the Vite cache and rebuild:
```bash
rm -rf node_modules/.vite
pnpm dev
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend dev server (port 5173) |
| `pnpm dev:api` | Start API server (port 3001) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed sample data (when available) |
| `pnpm format` | Format code with Prettier |

---

## Project Structure (Key Files)

```
INVESTWIZ/
├── .env                 ← Your local environment config (not committed)
├── .env.example         ← Template for .env
├── START_APP.bat        ← Windows launcher script
├── package.json         ← Dependencies and scripts
├── vite.config.ts       ← Vite + PWA + Tailwind config
├── tsconfig.json        ← TypeScript config
├── drizzle.config.ts    ← Database ORM config
├── local.db             ← Local SQLite database (auto-created)
├── src/                 ← Frontend source code
│   ├── main.tsx         ← App entry point
│   ├── app.tsx          ← Routes and providers
│   ├── pages/           ← Page components
│   ├── components/      ← Reusable UI components
│   ├── stores/          ← Zustand state stores
│   └── services/        ← API client
├── server/              ← Backend API source
│   ├── index.ts         ← Server entry point
│   ├── app.ts           ← Hono app with routes
│   ├── routes/          ← API route handlers
│   ├── middleware/      ← Auth middleware
│   ├── db/              ← Schema and migrations
│   └── utils/           ← JWT, password hashing, ID generation
└── api/                 ← Vercel serverless entry point
```

---

## Deploying to Production

See the deployment section in [README.md](../README.md) for Vercel deployment instructions. You'll need:

1. A [Turso](https://turso.tech/) cloud database (free tier available)
2. A [Vercel](https://vercel.com/) account
3. Environment variables set in the Vercel dashboard

---

## Tech Stack Reference

| Technology | Purpose | Docs |
|-----------|---------|------|
| Vite | Build tool & dev server | https://vite.dev |
| React 18 | UI framework | https://react.dev |
| TypeScript | Type safety | https://typescriptlang.org |
| Tailwind CSS v4 | Styling | https://tailwindcss.com |
| shadcn/ui | UI components | https://ui.shadcn.com |
| Hono | Backend API framework | https://hono.dev |
| Drizzle ORM | Database queries | https://orm.drizzle.team |
| Turso/libSQL | SQLite database | https://turso.tech |
| Zustand | State management | https://zustand.docs.pmnd.rs |
| TanStack Query | Server state & caching | https://tanstack.com/query |
| vite-plugin-pwa | PWA support | https://vite-pwa-org.netlify.app |
