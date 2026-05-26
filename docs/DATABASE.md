# Database Schema

Database: **Turso** (libSQL/SQLite-compatible)
ORM: **Drizzle ORM** (type-safe queries, migration generation)

## Tables

### users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Prefixed ID (usr_xxxx) |
| email | TEXT | UNIQUE, NOT NULL | User email address |
| password_hash | TEXT | NOT NULL | Argon2id hashed password |
| name | TEXT | NOT NULL | Display name |
| created_at | TEXT | NOT NULL, DEFAULT now | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL, DEFAULT now | ISO 8601 timestamp |

### refresh_tokens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Token ID |
| user_id | TEXT | FK → users.id, NOT NULL | Owner |
| token_hash | TEXT | NOT NULL | Hashed refresh token |
| expires_at | TEXT | NOT NULL | Expiration timestamp |
| created_at | TEXT | NOT NULL, DEFAULT now | Creation timestamp |

### portfolios

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Prefixed ID (ptf_xxxx) |
| user_id | TEXT | FK → users.id, NOT NULL | Owner |
| name | TEXT | NOT NULL | Portfolio name |
| currency | TEXT | NOT NULL, DEFAULT 'USD' | Base currency (ISO 4217) |
| created_at | TEXT | NOT NULL, DEFAULT now | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL, DEFAULT now | ISO 8601 timestamp |

**Indexes:** `idx_portfolios_user_id`

### transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Prefixed ID (txn_xxxx) |
| portfolio_id | TEXT | FK → portfolios.id, NOT NULL | Parent portfolio |
| symbol | TEXT | NOT NULL | Asset ticker symbol |
| type | TEXT | NOT NULL | buy, sell, dividend, split, transfer_in, transfer_out |
| quantity | REAL | NOT NULL | Number of units |
| price | REAL | NOT NULL | Price per unit at time of transaction |
| fees | REAL | NOT NULL, DEFAULT 0 | Transaction fees |
| date | TEXT | NOT NULL | Transaction date (YYYY-MM-DD) |
| notes | TEXT | | Optional notes |
| created_at | TEXT | NOT NULL, DEFAULT now | ISO 8601 timestamp |

**Indexes:** `idx_transactions_portfolio_id`, `idx_transactions_symbol`, `idx_transactions_date`

### holdings

Materialized view of current positions (recalculated on transaction changes).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Prefixed ID (hld_xxxx) |
| portfolio_id | TEXT | FK → portfolios.id, NOT NULL | Parent portfolio |
| symbol | TEXT | NOT NULL | Asset ticker symbol |
| asset_name | TEXT | NOT NULL | Human-readable asset name |
| asset_type | TEXT | NOT NULL | stock, etf, crypto, bond, mutual_fund, real_estate |
| quantity | REAL | NOT NULL | Total units held |
| avg_cost | REAL | NOT NULL | Average cost per unit |
| total_cost | REAL | NOT NULL | Total cost basis |
| updated_at | TEXT | NOT NULL, DEFAULT now | Last recalculation |

**Indexes:** `idx_holdings_portfolio_id`, `idx_holdings_symbol`
**Unique:** `(portfolio_id, symbol)`

### watchlists

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Prefixed ID (wl_xxxx) |
| user_id | TEXT | FK → users.id, NOT NULL | Owner |
| name | TEXT | NOT NULL | Watchlist name |
| created_at | TEXT | NOT NULL, DEFAULT now | ISO 8601 timestamp |

**Indexes:** `idx_watchlists_user_id`

### watchlist_items

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Prefixed ID |
| watchlist_id | TEXT | FK → watchlists.id, NOT NULL | Parent watchlist |
| symbol | TEXT | NOT NULL | Asset ticker symbol |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Display order |
| added_at | TEXT | NOT NULL, DEFAULT now | When added |

**Unique:** `(watchlist_id, symbol)`

### alerts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Prefixed ID (alt_xxxx) |
| user_id | TEXT | FK → users.id, NOT NULL | Owner |
| symbol | TEXT | NOT NULL | Asset ticker symbol |
| condition | TEXT | NOT NULL | 'above' or 'below' |
| target_price | REAL | NOT NULL | Trigger price |
| active | INTEGER | NOT NULL, DEFAULT 1 | 0 = triggered/disabled |
| triggered_at | TEXT | | When the alert fired |
| created_at | TEXT | NOT NULL, DEFAULT now | ISO 8601 timestamp |

**Indexes:** `idx_alerts_user_id`, `idx_alerts_active_symbol`

### goals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Prefixed ID (gl_xxxx) |
| user_id | TEXT | FK → users.id, NOT NULL | Owner |
| name | TEXT | NOT NULL | Goal name |
| target_amount | REAL | NOT NULL | Target dollar amount |
| target_date | TEXT | | Target completion date |
| monthly_contribution | REAL | | Planned monthly contribution |
| created_at | TEXT | NOT NULL, DEFAULT now | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL, DEFAULT now | ISO 8601 timestamp |

**Indexes:** `idx_goals_user_id`

### goal_portfolios

Links goals to portfolios (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| goal_id | TEXT | FK → goals.id, NOT NULL | Goal |
| portfolio_id | TEXT | FK → portfolios.id, NOT NULL | Linked portfolio |

**Primary Key:** `(goal_id, portfolio_id)`

## ID Generation

All IDs use the format: `{prefix}_{nanoid(12)}`

| Table | Prefix | Example |
|-------|--------|---------|
| users | usr | usr_a1b2c3d4e5f6 |
| portfolios | ptf | ptf_x7y8z9w0v1u2 |
| transactions | txn | txn_m3n4o5p6q7r8 |
| holdings | hld | hld_s9t0u1v2w3x4 |
| watchlists | wl | wl_y5z6a7b8c9d0 |
| alerts | alt | alt_e1f2g3h4i5j6 |
| goals | gl | gl_k7l8m9n0o1p2 |

## Migrations

Migrations are managed by Drizzle Kit and stored in `server/db/migrations/`.

```bash
# Generate a migration after schema changes
pnpm drizzle-kit generate

# Apply pending migrations
pnpm db:migrate

# View current schema in browser
pnpm db:studio
```

Migration files are forward-only. Never edit or delete an applied migration.

## Relationships

```
users
 ├── portfolios (1:N)
 │    ├── transactions (1:N)
 │    ├── holdings (1:N, materialized)
 │    └── goal_portfolios (N:M with goals)
 ├── watchlists (1:N)
 │    └── watchlist_items (1:N)
 ├── alerts (1:N)
 ├── goals (1:N)
 │    └── goal_portfolios (N:M with portfolios)
 └── refresh_tokens (1:N)
```

## SQLite/Turso Notes

- No native `DATETIME` type — dates stored as ISO 8601 TEXT strings
- No native `BOOLEAN` — use INTEGER (0/1)
- `REAL` for all decimal numbers (prices, quantities)
- Foreign keys enforced via `PRAGMA foreign_keys = ON`
- Turso supports `RETURNING` clause for inserts/updates
- Use `BEGIN IMMEDIATE` for write transactions to avoid SQLITE_BUSY
