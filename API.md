**API**

| Method | Endpoint                               | Description                        | Request Body                         | Response Body                                                 |
|--------|----------------------------------------|------------------------------------|--------------------------------------|---------------------------------------------------------------|
| POST   | `/login`                               | Authenticate and get a bearer token| `{ username, passord }` | `{ token }`                                        |
| POST   | `/portfolios`                          | Create a new portfolio             | `{ name, description }` | `{ id,  user_id,  name, description, created, modified, total_invested, num_assets }` |
| GET    | `/portfolios`                          | List all portfolios                | —                      | `[{ id,  user_id,  name, description, created, modified, total_invested, num_assets }]`|
| GET    | `/portfolios/{portfolio_id}`           | Get a portfolio by ID              | —                      | `{ id,  user_id,  name, description, created, modified, total_invested, num_assets }`|
| DELETE | `/portfolios/{portfolio_id}`           | Delete a portfolio                 | —                      | `{ id }`                                                 |
| GET    | `/portfolios/{portfolio_id}/assets`    | List assets in a portfolio         | —                      | `[{ id, portfolio_id, name, ticker, created, modified, holdings, invested, avg_price, portfolio_contribution }]`                         |
| POST   | `/portfolios/{portfolio_id}/assets`    | Add an asset to a portfolio        | `{ name, ticker }`      | `{ id, portfolio_id, name, ticker, created, modified, holdings, invested, avg_price, portfolio_contribution }` |
| GET    | `/portfolios/{portfolio_id}/assets/{asset_id}` | Get an asset by ID         | —                      | `{ id, portfolio_id, name, ticker, created, modified, holdings, invested, avg_price, portfolio_contribution }`                           |
| DELETE | `/portfolios/{portfolio_id}/assets/{asset_id}` | Delete an asset by ID      | —                      | `{ id }`                                                 |

---

## Authentication

Obtain a **Bearer** token to authorize subsequent requests.

```http
POST /login
Content-Type: application/json

{
  "username": "jane.doe",
  "password": "s3cr3t"
}

Response 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

---

## Portfolio Endpoints

Create, list, retrieve or delete portfolios.

### Create a Portfolio

```http
POST /portfolios
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Retirement Fund",
  "description": "Long-term growth portfolio"
}

Response 201 Created
{
  "id": 5,
  "user_id": 2,
  "name": "Retirement Fund",
  "description": "Long-term growth portfolio",
  "created": "2025-08-12T14:33:00Z",
  "modified": "2025-08-12T14:33:00Z",
  "total_invested": 0,
  "num_assets": 0
}
```

### List All Portfolios

```http
GET /portfolios
Authorization: Bearer <token>

Response 200 OK
[
  {
    "id": 5,
    "user_id": 2,
    "name": "Retirement Fund",
    "description": "Long-term growth portfolio",
    "created": "...",
    "modified": "...",
    "total_invested": 12000,
    "num_assets": 4
  },
  …
]
```

---

## Asset Endpoints

Manage assets within a specific portfolio.

### Add an Asset

```http
POST /portfolios/{portfolio_id}/assets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Apple Inc.",
  "ticker": "AAPL"
}

Response 201 Created
{
  "id": 12,
  "portfolio_id": 5,
  "name": "Apple Inc.",
  "ticker": "AAPL",
  "created": "2025-08-12T15:20:00Z",
  "modified": "2025-08-12T15:20:00Z",
  "holdings": 0,
  "invested": 0,
  "avg_price": 0,
  "portfolio_contribution": 0
}
```

### List Assets in a Portfolio

```http
GET /portfolios/{portfolio_id}/assets
Authorization: Bearer <token>

Response 200 OK
[
  {
    "id": 12,
    "portfolio_id": 5,
    "name": "Apple Inc.",
    "ticker": "AAPL",
    "created": "...",
    "modified": "...",
    "holdings": 50,
    "invested": 7000,
    "avg_price": 140,
    "portfolio_contribution": 0.58
  },
  …
]
```