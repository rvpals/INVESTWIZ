# API Documentation

Base URL: `/api`

All endpoints return JSON. Protected endpoints require a valid JWT cookie.

## Authentication

### POST /api/auth/register

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

Sets HTTP-only cookie: `token` (JWT, 15min expiry) and `refresh_token` (7 day expiry).

**Errors:** 409 (email exists), 422 (validation failed)

---

### POST /api/auth/login

Authenticate an existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:** 401 (invalid credentials)

---

### POST /api/auth/refresh

Refresh an expired access token using the refresh token cookie.

**Response (200):**
```json
{
  "success": true
}
```

Sets new `token` cookie.

**Errors:** 401 (invalid/expired refresh token)

---

### POST /api/auth/logout

Invalidate the current session.

**Response (200):**
```json
{
  "success": true
}
```

Clears both cookies, invalidates refresh token in DB.

---

## Portfolios

All portfolio endpoints require authentication.

### GET /api/portfolios

List all portfolios for the authenticated user.

**Response (200):**
```json
{
  "portfolios": [
    {
      "id": "ptf_abc123",
      "name": "Retirement",
      "currency": "USD",
      "totalValue": 45230.50,
      "totalGain": 5230.50,
      "totalGainPercent": 13.08,
      "holdingsCount": 12,
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### POST /api/portfolios

Create a new portfolio.

**Request:**
```json
{
  "name": "Retirement",
  "currency": "USD"
}
```

**Response (201):**
```json
{
  "portfolio": {
    "id": "ptf_abc123",
    "name": "Retirement",
    "currency": "USD",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

---

### GET /api/portfolios/:id

Get a single portfolio with holdings summary.

**Response (200):**
```json
{
  "portfolio": {
    "id": "ptf_abc123",
    "name": "Retirement",
    "currency": "USD",
    "holdings": [
      {
        "id": "hld_xyz789",
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "assetType": "stock",
        "quantity": 50,
        "avgCost": 150.00,
        "currentPrice": 185.50,
        "marketValue": 9275.00,
        "unrealizedGain": 1775.00,
        "unrealizedGainPercent": 23.67
      }
    ],
    "summary": {
      "totalValue": 45230.50,
      "totalCost": 40000.00,
      "totalGain": 5230.50,
      "totalGainPercent": 13.08,
      "dayChange": 320.15,
      "dayChangePercent": 0.71
    }
  }
}
```

---

### PATCH /api/portfolios/:id

Update portfolio details.

**Request:**
```json
{
  "name": "Retirement Fund"
}
```

**Response (200):** Updated portfolio object.

---

### DELETE /api/portfolios/:id

Delete a portfolio and all its transactions.

**Response (204):** No content.

---

## Transactions

### GET /api/portfolios/:portfolioId/transactions

List transactions for a portfolio.

**Query params:** `?page=1&limit=50&symbol=AAPL&type=buy`

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "txn_def456",
      "symbol": "AAPL",
      "type": "buy",
      "quantity": 10,
      "price": 150.00,
      "fees": 0,
      "date": "2026-01-10",
      "notes": "Initial position",
      "createdAt": "2026-01-10T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 127,
    "totalPages": 3
  }
}
```

---

### POST /api/portfolios/:portfolioId/transactions

Record a new transaction.

**Request:**
```json
{
  "symbol": "AAPL",
  "type": "buy",
  "quantity": 10,
  "price": 150.00,
  "fees": 0,
  "date": "2026-01-10",
  "notes": "Initial position"
}
```

**Transaction types:** `buy`, `sell`, `dividend`, `split`, `transfer_in`, `transfer_out`

**Response (201):** Transaction object + updated holding.

---

### DELETE /api/portfolios/:portfolioId/transactions/:id

Delete a transaction (recalculates holdings).

**Response (204):** No content.

---

## Market Data

### GET /api/market/quotes

Get current quotes for multiple symbols.

**Query params:** `?symbols=AAPL,MSFT,BTC-USD`

**Response (200):**
```json
{
  "quotes": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 185.50,
      "change": 2.30,
      "changePercent": 1.25,
      "volume": 52340000,
      "marketCap": 2870000000000,
      "updatedAt": "2026-01-15T16:00:00Z"
    }
  ]
}
```

---

### GET /api/market/history/:symbol

Get historical price data.

**Query params:** `?range=1y&interval=1d`

Ranges: `1d`, `5d`, `1m`, `3m`, `6m`, `1y`, `5y`, `max`
Intervals: `5m`, `15m`, `1h`, `1d`, `1w`, `1m`

**Response (200):**
```json
{
  "symbol": "AAPL",
  "data": [
    {
      "date": "2025-01-15",
      "open": 148.50,
      "high": 152.30,
      "low": 147.80,
      "close": 151.20,
      "volume": 48500000
    }
  ]
}
```

---

### GET /api/market/search

Search for assets by name or symbol.

**Query params:** `?q=apple&type=stock`

**Response (200):**
```json
{
  "results": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "type": "stock",
      "exchange": "NASDAQ"
    }
  ]
}
```

---

### GET /api/market/news

Get market news, optionally filtered by symbol.

**Query params:** `?symbol=AAPL&limit=20`

**Response (200):**
```json
{
  "news": [
    {
      "title": "Apple Reports Record Q1 Earnings",
      "summary": "...",
      "url": "https://...",
      "source": "Reuters",
      "publishedAt": "2026-01-15T09:00:00Z",
      "symbols": ["AAPL"]
    }
  ]
}
```

---

## Watchlists

### GET /api/watchlists

List user's watchlists.

**Response (200):**
```json
{
  "watchlists": [
    {
      "id": "wl_ghi789",
      "name": "Tech Stocks",
      "symbols": ["AAPL", "MSFT", "GOOGL", "NVDA"],
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### POST /api/watchlists

Create a watchlist.

### PATCH /api/watchlists/:id

Update watchlist (rename, add/remove symbols).

### DELETE /api/watchlists/:id

Delete a watchlist.

---

## Alerts

### GET /api/alerts

List user's price alerts.

**Response (200):**
```json
{
  "alerts": [
    {
      "id": "alt_jkl012",
      "symbol": "AAPL",
      "condition": "above",
      "targetPrice": 200.00,
      "currentPrice": 185.50,
      "active": true,
      "triggeredAt": null,
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### POST /api/alerts

Create a price alert.

**Request:**
```json
{
  "symbol": "AAPL",
  "condition": "above",
  "targetPrice": 200.00
}
```

Conditions: `above`, `below`

---

### DELETE /api/alerts/:id

Delete an alert.

---

## Goals

### GET /api/goals

List investment goals.

### POST /api/goals

Create a goal.

**Request:**
```json
{
  "name": "Retirement",
  "targetAmount": 1000000,
  "targetDate": "2045-01-01",
  "monthlyContribution": 2000,
  "linkedPortfolioIds": ["ptf_abc123"]
}
```

### PATCH /api/goals/:id

Update a goal.

### DELETE /api/goals/:id

Delete a goal.

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Standard error codes:**

| HTTP Status | Code | Meaning |
|-------------|------|---------|
| 400 | `BAD_REQUEST` | Malformed request |
| 401 | `UNAUTHORIZED` | Missing or invalid auth |
| 403 | `FORBIDDEN` | Authenticated but not allowed |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `CONFLICT` | Resource already exists |
| 422 | `VALIDATION_ERROR` | Input validation failed |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
