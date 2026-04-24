# API Documentation

## Authentication Endpoints

| Method | Endpoint                   | Description                              | Request Body | Response Body |
| ------ | -------------------------- | ---------------------------------------- | ------------ | ------------- |
| POST   | `/login`                   | Authenticate and get a bearer token      | See below    | See below     |
| GET    | `/auth/refresh_token`      | Gets a new token with extended expiry    | -            | See below     |

### Login
Authenticate with username and password to receive a JWT bearer token.

**Request:**
```json
{
  "username": "string (required, non-empty)",
  "password": "string (required, non-empty)"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshBefore": 518400
}
```

### Refresh Token
Get a new bearer token with extended expiry without credentials (requires valid token in Authorization header).

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshBefore": 518400
}
```

---

## User/Profile Endpoints

| Method | Endpoint      | Description                   | Request Body | Response Body |
| ------ | ------------- | ----------------------------- | ------------ | ------------- |
| GET    | `/profile`    | Get current user profile      | -            | See below     |
| PUT    | `/profile`    | Update current user profile   | See below    | See below     |
| POST   | `/profile`    | Update current user password  | See below    | See below     |
| DELETE | `/profile`    | Delete current user profile   | -            | See below     |

### Get Profile
Retrieve the current authenticated user's profile information.

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "admin": true,
  "login_attempts": 0,
  "locked": false,
  "created": "2026-02-14T21:20:21.000Z",
  "modified": "2026-02-14T21:20:21.000Z"
}
```

### Update Profile
Update the current user's profile information (username, admin status, etc.).

**Request:**
```json
{
  "username": "admin_updated",
  "admin": true,
  "login_attempts": 0,
  "locked": false
}
```

**Response:** (same as Get Profile)

### Change Password
Update the current user's password.

**Request:**
```json
{
  "oldPassword": "string (required, non-empty)",
  "newPassword": "string (required, non-empty)",
  "repeat": "string (required, must match newPassword)"
}
```

**Response:** (same as Get Profile)

### Delete Profile
Delete the current user's profile and all associated data.

**Response:**
```json
{
  "id": 1
}
```

---

## User Preferences Endpoints

| Method | Endpoint | Description              | Request Body | Response Body |
| ------ | -------- | ------------------------ | ------------ | ------------- |
| GET    | `/prefs` | Get current user prefs   | -            | See below     |
| PUT    | `/prefs` | Update current user prefs| See below    | See below     |

### Get Preferences
Retrieve the current user's preferences (e.g., base currency, display options).

**Response:**
```json
{
  "id": 1,
  "base_ccy": "GBP",
  "additional": {
    "altChart": false
  }
}
```

### Update Preferences
Update the current user's preferences.

**Request:**
```json
{
  "base_ccy": "EUR",
  "additional": {
    "altChart": true
  }
}
```

**Supported currencies:** USD, GBP, EUR, CAD, AUD, CHF, SEK, NOK, DKK, NZD, JPY, INR

**Response:** (same as Get Preferences)

---

## User Management Endpoints (Admin Only)

| Method | Endpoint             | Description                       | Request Body | Response Body |
| ------ | -------------------- | --------------------------------- | ------------ | ------------- |
| GET    | `/users`             | Get all users (admin only)        | -            | See below     |
| GET    | `/users/{user_id}`   | Get user by ID (admin only)       | -            | See below     |
| DELETE | `/users/{user_id}`   | Delete user by ID (admin only)    | -            | See below     |
| POST   | `/users`             | Create new user (admin only)      | See below    | See below     |
| PUT    | `/users/{user_id}`   | Update user (admin only)          | See below    | See below     |

### List All Users
Retrieve all users in the system. **Requires admin privileges.**

**Response:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "admin": true,
    "login_attempts": 0,
    "locked": false,
    "created": "2026-02-14T21:20:21.000Z",
    "modified": "2026-02-14T21:20:21.000Z"
  },
  {
    "id": 2,
    "username": "jane_smith",
    "admin": false,
    "login_attempts": 0,
    "locked": false,
    "created": "2026-03-01T10:30:00.000Z",
    "modified": "2026-04-21T14:22:00.000Z"
  }
]
```

### Get User
Retrieve a specific user by ID. **Requires admin privileges.**

**Response:** (same structure as single user in List All Users)

### Create User
Create a new user account. **Requires admin privileges.**

**Request:**
```json
{
  "username": "jane_smith",
  "admin": false,
  "login_attempts": 0,
  "locked": false
}
```

**Response:** (same as Get User)

### Update User
Update an existing user's information. **Requires admin privileges.**

**Request:** (same as Create User)

**Response:** (same as Get User)

### Delete User
Delete a user account. **Requires admin privileges.**

**Response:**
```json
{
  "id": 2
}
```

---

## Summary Endpoint

| Method | Endpoint     | Description                      | Request Body | Response Body |
| ------ | ------------ | -------------------------------- | ------------ | ------------- |
| GET    | `/summary`   | Summary across all portfolios    | -            | See below     |

### Get Summary
Retrieve aggregated summary data across all portfolios, including total invested, realized P&L, and charts.

**Query Parameters (optional):**
- `range`: Time range for chart data. Valid values: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max`. Default: `1d`

**Example:** `GET /summary?range=1y`

**Response:**
```json
{
  "numPortfolios": 1,
  "meta": {
    "range": "1d",
    "validRanges": ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"],
    "fiftyTwoWeekLow": 163533.54,
    "fiftyTwoWeekHigh": 221598.82,
    "volatilityRange": 58065.28,
    "volatilityPct": 0.3015,
    "currencies": ["USD", "GBp", "GBP"],
    "exchanges": ["NMS", "NYQ", "LSE", "CCC"],
    "types": ["EQUITY", "ETF", "CRYPTOCURRENCY"]
  },
  "chart": [
    {
      "timestamp": 1776729300,
      "price": 32091.83,
      "volume": 0,
      "tx": null
    },
    {
      "timestamp": 1776729600,
      "price": 32094.20,
      "volume": 5242880,
      "tx": null
    }
  ],
  "multiChart": {
    "USD": [...],
    "GBP": [...]
  },
  "changes": {
    "startPrice": 0,
    "endPrice": 32091.83,
    "returnValue": 1000.50,
    "returnPct": 0.0312,
    "startTs": 1776729300,
    "endTs": 1776794139
  },
  "totals": {
    "returnValue": 1000.50,
    "returnPct": 0.0312
  },
  "invested": 32000.00,
  "realizedPnl": 500.00,
  "breakEven": 31500.00,
  "fxImpact": -50.00
}
```

---

## Portfolio Endpoints

| Method | Endpoint                          | Description                  | Request Body | Response Body |
| ------ | --------------------------------- | ---------------------------- | ------------ | ------------- |
| POST   | `/portfolios`                     | Create a new portfolio       | See below    | See below     |
| GET    | `/portfolios`                     | List all portfolios          | -            | See below     |
| GET    | `/portfolios/{portfolio_id}`      | Get a portfolio by ID        | -            | See below     |
| PUT    | `/portfolios/{portfolio_id}`      | Update a portfolio           | See below    | See below     |
| DELETE | `/portfolios/{portfolio_id}`      | Delete a portfolio           | -            | See below     |

### Create Portfolio
Create a new portfolio for organizing assets.

**Request:**
```json
{
  "name": "Test Portfolio",
  "description": "Test Description"
}
```

**Response:**
```json
{
  "id": 1733,
  "user_id": 1,
  "name": "Test Portfolio",
  "description": "Test Description",
  "num_assets": 0,
  "created": "2026-04-21T16:55:49.000Z",
  "modified": "2026-04-21T16:55:49.000Z",
  "meta": {
    "range": "1d",
    "validRanges": ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"],
    "volatilityRange": 0,
    "volatilityPct": 0,
    "currencies": [],
    "exchanges": [],
    "types": [],
    "fiftyTwoWeekLow": 0,
    "fiftyTwoWeekHigh": 0
  },
  "weight": null,
  "domestic": false,
  "chart": [],
  "multiChart": {},
  "changes": {
    "startPrice": 0,
    "endPrice": 0,
    "returnValue": 0,
    "returnPct": 0,
    "startTs": 0,
    "endTs": 0
  },
  "totals": {
    "returnValue": 0,
    "returnPct": 0
  },
  "invested": 0,
  "realizedPnl": 0,
  "breakEven": 0,
  "fxImpact": 0
}
```

### List All Portfolios
Retrieve all portfolios for the current user.

**Query Parameters (optional):**
- `range`: Time range for chart data. Valid values: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max`. Default: `1d`

**Example:** `GET /portfolios?range=1y`

**Response:**
```json
[
  {
    "id": 1733,
    "user_id": 1,
    "name": "Test Portfolio",
    "description": "Test Description",
    "num_assets": 1,
    "created": "2026-04-21T16:55:49.000Z",
    "modified": "2026-04-21T16:55:49.000Z",
    "meta": {
      "range": "1d",
      "validRanges": ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"],
      "volatilityRange": 95.37,
      "volatilityPct": 0.3958,
      "currencies": ["USD"],
      "exchanges": ["NMS"],
      "types": ["EQUITY"],
      "fiftyTwoWeekLow": 193.25,
      "fiftyTwoWeekHigh": 288.62
    },
    "weight": 0.0621,
    "domestic": false,
    "chart": [...],
    "multiChart": {},
    "changes": {
      "startPrice": 0,
      "endPrice": 1972.64,
      "returnValue": 859.90,
      "returnPct": 0.7723,
      "startTs": 1776777900,
      "endTs": 1776794239
    },
    "totals": {
      "returnValue": 1355.82,
      "returnPct": 0.6614
    },
    "invested": 2050,
    "realizedPnl": 0,
    "breakEven": 2050,
    "fxImpact": 0
  }
]
```

### Get Portfolio
Retrieve a specific portfolio by ID.

**Query Parameters (optional):**
- `range`: Time range for chart data. Valid values: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max`. Default: `1d`

**Example:** `GET /portfolios/1733?range=1y`

**Response:** (same structure as single portfolio in List All Portfolios)

### Update Portfolio
Update portfolio name or description.

**Request:**
```json
{
  "name": "Tech Stocks Updated",
  "description": "Updated growth-focused technology investments"
}
```

**Response:** (same as Get Portfolio)

### Delete Portfolio
Delete a portfolio. This will also delete all assets and transactions within it.

**Response:**
```json
{
  "id": 1
}
```

---

## Asset Endpoints

| Method | Endpoint                                           | Description                             | Request Body | Response Body |
| ------ | -------------------------------------------------- | --------------------------------------- | ------------ | ------------- |
| POST   | `/portfolios/{portfolio_id}/assets`                | Add an asset to a portfolio             | See below    | See below     |
| GET    | `/portfolios/{portfolio_id}/assets`                | List assets in a portfolio              | -            | See below     |
| GET    | `/portfolios/{portfolio_id}/assets/{asset_id}`    | Get an asset by ID                      | -            | See below     |
| PUT    | `/portfolios/{portfolio_id}/assets/{asset_id}`    | Update an asset                         | See below    | See below     |
| DELETE | `/portfolios/{portfolio_id}/assets/{asset_id}`    | Delete an asset                         | -            | See below     |
| PATCH  | `/portfolios/{portfolio_id}/assets/{asset_id}/move/{new_portfolio_id}` | Move asset to another portfolio | - | See below |

### Create Asset
Add a new asset (stock, ETF, etc.) to a portfolio.

**Request:**
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc."
}
```

**Response:**
```json
{
  "id": 1,
  "portfolio_id": 1733,
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "user_id": 1,
  "holdings": 0,
  "invested": 0,
  "avg_price": 0,
  "break_even": 0,
  "realized_pnl": 0,
  "num_txs": 0,
  "last_activity": null,
  "last_activity_ts": null,
  "base_ccy": "USD",
  "created": "2026-04-21T16:55:49.000Z",
  "modified": "2026-04-21T16:55:49.000Z",
  "meta": {
    "range": "1d",
    "validRanges": ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"],
    "volatilityRange": 0,
    "volatilityPct": 0,
    "fiftyTwoWeekLow": 0,
    "fiftyTwoWeekHigh": 0
  },
  "weight": null,
  "volatilityRange": 0,
  "volatilityPct": 0,
  "ccy": {
    "chart": [],
    "changes": {
      "startPrice": 0,
      "endPrice": 0,
      "returnValue": 0,
      "returnPct": 0,
      "startTs": 0,
      "endTs": 0
    },
    "totals": {
      "returnValue": 0,
      "returnPct": 0
    }
  },
  "base": {
    "domestic": false,
    "invested": 0,
    "fxImpact": 0,
    "fxRate": 1,
    "chart": [],
    "changes": {
      "startPrice": 0,
      "endPrice": 0,
      "returnValue": 0,
      "returnPct": 0,
      "startTs": 0,
      "endTs": 0
    },
    "totals": {
      "returnValue": 0,
      "returnPct": 0
    },
    "avgPrice": null,
    "breakEven": null,
    "realizedPnl": 0
  }
}
```

### List Assets
Retrieve all assets in a portfolio.

**Query Parameters (optional):**
- `range`: Time range for chart data. Valid values: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max`. Default: `1d`

**Example:** `GET /portfolios/1733/assets?range=1y`

**Response:**
```json
[
  {
    "id": 1,
    "portfolio_id": 1733,
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "user_id": 1,
    "holdings": 10,
    "invested": 2050,
    "avg_price": 205,
    "break_even": 205,
    "realized_pnl": 0,
    "num_txs": 1,
    "last_activity": "2026-04-21T16:55:49.000Z",
    "last_activity_ts": 1776794549,
    "base_ccy": "USD",
    "created": "2026-04-21T16:55:49.000Z",
    "modified": "2026-04-21T16:55:49.000Z",
    "meta": {...},
    "weight": 0.0621,
    "volatilityRange": 95.37,
    "volatilityPct": 0.3958,
    "ccy": {...},
    "base": {...}
  }
]
```

### Get Asset
Retrieve details for a specific asset.

**Query Parameters (optional):**
- `range`: Time range for chart data. Valid values: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max`. Default: `1d`

**Example:** `GET /portfolios/1733/assets/1?range=1y`

**Response:** (same as single asset in List Assets)

### Update Asset
Update asset details (ticker, name).

**Request:**
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc. - Updated"
}
```

**Response:** (same as Get Asset)

### Delete Asset
Delete an asset and all its associated transactions.

**Response:**
```json
{
  "id": 10
}
```

### Move Asset
Move an asset from one portfolio to another.

**Response:**
```json
{
  "id": 10
}
```

---

## Transaction Endpoints

| Method | Endpoint                                               | Description                            | Request Body | Response Body |
| ------ | ------------------------------------------------------ | -------------------------------------- | ------------ | ------------- |
| POST   | `/portfolios/{portfolio_id}/assets/{asset_id}/tx`      | Create a transaction for an asset      | See below    | See below     |
| GET    | `/portfolios/{portfolio_id}/assets/{asset_id}/tx`      | List all transactions for an asset     | -            | See below     |
| GET    | `/portfolios/{portfolio_id}/assets/{asset_id}/tx/{tx_id}` | Get a transaction by ID            | -            | See below     |
| PUT    | `/portfolios/{portfolio_id}/assets/{asset_id}/tx/{tx_id}` | Update a transaction               | See below    | See below     |
| DELETE | `/portfolios/{portfolio_id}/assets/{asset_id}/tx/{tx_id}` | Delete a transaction               | -            | See below     |
| POST   | `/portfolios/{portfolio_id}/assets/{asset_id}/txs`     | Bulk insert transactions (CSV upload)  | See below    | See below     |
| DELETE | `/portfolios/{portfolio_id}/assets/{asset_id}/txs`     | Delete all transactions for an asset   | -            | See below     |

### Create Transaction
Record a buy or sell transaction for an asset.

**Request:**
```json
{
  "type": "buy",
  "quantity": 10,
  "price": 205,
  "date": "2026-04-21T16:55:49.000Z",
  "comments": "Initial purchase"
}
```

**Response:**
```json
{
  "id": 1,
  "asset_id": 1,
  "type": "buy",
  "quantity": 10,
  "price": 205,
  "date": "2026-04-21T16:55:49.000Z",
  "comments": "Initial purchase",
  "quantity_ext": 10,
  "stretch": 1,
  "final_stretch": false,
  "value": null,
  "pnl": null,
  "pnl_pct": null,
  "realized_pnl": 0,
  "cost": 2050,
  "cost_basis": 2050,
  "contribution": 100,
  "running_holding": 10,
  "running_cost": 2050,
  "running_average_price": 205,
  "running_break_even": 205,
  "running_contribution": 100,
  "asset_name": "Apple Inc.",
  "asset_ticker": "AAPL",
  "portfolio_name": "Test Portfolio",
  "portfolio_description": "Test Description",
  "user_id": 1,
  "user_base_ccy": "GBP",
  "timestamp": 1776794549,
  "created": "2026-04-21T16:55:49.000Z",
  "modified": "2026-04-21T16:55:49.000Z"
}
```

### List Transactions
Retrieve all transactions for an asset.

**Response:**
```json
[
  {
    "id": 45,
    "asset_id": 10,
    "type": "buy",
    "quantity": 10,
    "price": 150.25,
    "date": "2023-10-15T14:30:00Z",
    "comments": "Purchased at market open",
    "quantity_ext": 10,
    "asset_name": "Apple Inc.",
    "asset_ticker": "AAPL"
  },
  {
    "id": 46,
    "asset_id": 10,
    "type": "buy",
    "quantity": 5,
    "price": 152.00,
    "date": "2023-10-18T09:00:00Z",
    "comments": ""
  }
]
```

### Get Transaction
Retrieve details for a specific transaction.

**Response:** (same as single transaction in List Transactions)

### Update Transaction
Update an existing transaction.

**Request:**
```json
{
  "type": "buy",
  "quantity": 12,
  "price": 150.25,
  "date": "2023-10-15T14:30:00Z",
  "comments": "Updated quantity"
}
```

**Response:** (same as Get Transaction)

### Delete Transaction
Delete a specific transaction.

**Response:**
```json
{
  "id": 45
}
```

### Bulk Upload Transactions
Upload multiple transactions at once (e.g., from CSV file).

**Request:**
```json
{
  "replace": true,
  "txs": [
    {
      "type": "buy",
      "quantity": 10,
      "price": 150.25,
      "date": "2023-10-15T14:30:00Z",
      "comments": ""
    },
    {
      "type": "sell",
      "quantity": 5,
      "price": 160.00,
      "date": "2023-10-18T10:00:00Z",
      "comments": "Partial profit taking"
    }
  ]
}
```

- **`replace`**: If `true`, deletes all existing transactions and inserts the provided ones. If `false`, appends to existing transactions.

**Response:**
```json
[
  {
    "id": 47
  },
  {
    "id": 48
  }
]
```

### Delete All Transactions
Delete all transactions for a specific asset.

**Response:**
```json
{
  "id": 10
}
```

---

## Lookup/Search Endpoints

| Method | Endpoint                           | Description                              | Request/Query | Response Body |
| ------ | ---------------------------------- | ---------------------------------------- | ------------- | ------------- |
| GET    | `/lookup/ticker`                   | Search for ticker details                | `term` (query param) | See below |
| GET    | `/lookup/quote/{base}/{date?}`     | Get quote for a ticker (with optional date) | Path params | See below |
| GET    | `/lookup/fx/{base}/{ccy}/{date?}`  | Get FX rates for base/currency pair (with optional date) | Path params | See below |

### Search Tickers
Search for ticker symbols and company names. Returns matching results from Yahoo Finance.

**Query Parameters:**
- `term` (required): Search term (ticker symbol or company name, e.g., "AAPL" or "Apple")

**Example:** `GET /lookup/ticker?term=apple`

**Response:**
```json
{
  "quotes": [
    {
      "symbol": "AAPL",
      "exchange": "NMS",
      "shortname": "Apple Inc.",
      "longname": "Apple Inc.",
      "quoteType": "EQUITY"
    },
    {
      "symbol": "AAPL.SW",
      "exchange": "EBS",
      "shortname": "APPLE INC",
      "longname": null,
      "quoteType": "EQUITY"
    },
    {
      "symbol": "AAPW",
      "exchange": "BTS",
      "shortname": "Roundhill AAPL WeeklyPay ETF",
      "longname": null,
      "quoteType": "ETF"
    }
  ]
}
```

### Get Quote
Retrieve the current or historical quote for a ticker symbol.

**Path Parameters:**
- `base` (required): Ticker symbol (e.g., "AAPL")
- `date` (optional): ISO 8601 date string (e.g., "2023-10-15"). If omitted, returns latest quote.

**Example:** `GET /lookup/quote/AAPL/2023-10-15`

**Response:**
```json
{
  "timestamp": 1776794146,
  "price": 266.2950134277344,
  "volume": 27800253,
  "tx": null
}
```

### Get FX Rate
Retrieve foreign exchange rate for a currency pair.

**Path Parameters:**
- `base` (required): Base currency (e.g., "USD")
- `ccy` (required): Target currency (e.g., "EUR")
- `date` (optional): ISO 8601 date string. If omitted, returns latest rate.

**Example:** `GET /lookup/fx/USD/EUR/2023-10-15`

**Response:**
```json
{
  "ccy": "EUR",
  "base": "USD",
  "rate": 0.8514999747276306,
  "timestamp": 1776794139
}
```

---

## Error Responses

All endpoints return error responses in the following format:

**HTTP 400 Bad Request:**
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username is required"
    }
  ]
}
```

**HTTP 401 Unauthorized:**
```json
{
  "status": 401,
  "message": "Authentication failed"
}
```

**HTTP 403 Forbidden:**
```json
{
  "status": 403,
  "message": "Admin privileges required"
}
```

**HTTP 404 Not Found:**
```json
{
  "status": 404,
  "message": "Resource not found"
}
```

**HTTP 500 Internal Server Error:**
```json
{
  "status": 500,
  "message": "Internal server error"
}
```

---

## Authentication

All endpoints except `/login` and `/lookup/*` require authentication via bearer token:

```
Authorization: Bearer eyJhbGc...
```

Obtain a token by calling `/login` with credentials, then include it in the `Authorization` header for subsequent requests.
