# `Assets` — Personal Wealth Tracker

[![CHECKS-AND-INTEGRATION-TESTS](https://github.com/venil7/assets/actions/workflows/build-and-test.yaml/badge.svg)](https://github.com/venil7/assets/actions/workflows/build-and-test.yaml)
[![RELEASE-DOCKER-CONTAINER](https://github.com/venil7/assets/actions/workflows/build-docker-container.yaml/badge.svg)](https://github.com/venil7/assets/actions/workflows/build-docker-container.yaml)

A self-hosted portfolio and wealth tracker for personal finance management. Consolidate your investments across brokers and accounts - ISA, 401k, IRA, Taxable, Crypto or custom portfolios - and monitor performance with complete privacy and data ownership. Built on real-time market data from [Yahoo Finance](https://finance.yahoo.com/).

**Why self-host?** Keep your financial data private. No third-party tracking, no cloud constraints, no monthly subscriptions. Your wealth data stays on your servers.

## Key Features

- **Multi-user support** — Manage portfolios for multiple users on a single instance
- **Multi-portfolio tracking** — ISA, 401k, IRA, Taxable, Pension, Crypto, or custom categories
- **Portfolio performance analytics** — Total net worth, individual or aggregated performance
- **Real-time market data** — Live prices for any publicly-traded asset via Yahoo Finance API
- **Multi-currency support** — Track assets in any major currency with automatic FX conversion
- **Return calculations** — Realized gains, unrealized returns, and FX impact analysis
- **Transaction-level insights** — Per-transaction P&L, cost basis tracking
- **CSV import** — Bulk import transactions from broker exports (most platforms supported)
- **REST API** — Full-featured API for integration or headless operation
- **Web dashboard** — Modern, responsive UI for desktop and mobile (built with React + TypeScript)

## Ideal For

- **Individual investors** tracking portfolios across multiple brokers or accounts
- **Households** monitoring combined net worth and investment performance
- **Privacy-conscious users** who want investment data on their own servers
- **Power users** comfortable self-hosting and importing transaction data manually
- **Integration scenarios** where REST API access to portfolio data is needed

---
<img width="235" height="500" alt="screenshot1" src="https://github.com/user-attachments/assets/f5bceba8-cf8e-4dac-a531-ce896f9e7d4b" />
<img width="235" height="500" alt="screenshot0" src="https://github.com/user-attachments/assets/7932f0ec-bdab-4987-90f6-0914e2852e29" />
<img width="235" height="500" alt="screenshot2" src="https://github.com/user-attachments/assets/fb6e09d8-91f1-4053-8cdf-93d0d7fc7741" />
<img width="235" height="500" alt="screenshot3" src="https://github.com/user-attachments/assets/e81ec8e2-919b-43d3-b919-34a39f108c6c" />

---
## Mobile Client

A mobile client written in Flutter can be connected to `assets`, and has its own repository [here](https://github.com/venil7/assets_client)

---

## Quick Start

### Docker (Fastest)

Pull and run the latest image:

```bash
docker pull ghcr.io/venil7/assets:latest
docker run \
  -e ASSETS_JWT_SECRET=YourSecretKey123 \
  -e ASSETS_DB=/data/assets.db \
  -p 4020:4020 \
  -v ${PWD}:/data \
  ghcr.io/venil7/assets
```

Then open [http://localhost:4020](http://localhost:4020) and login with `admin` / `admin`

> **Note:** Change `ASSETS_JWT_SECRET` to a strong random value for production.

### Docker Compose (Recommended for Production)

1. Create a `.env` file with required parameters:

```bash
TAG=latest
ASSETS_JWT_SECRET=YourSecretKey123RandomString
ASSETS_CACHE_TTL=10m
ASSETS_JWT_EXPIRES_IN=1w
ASSETS_JWT_REFRESH_BEFORE=5d
```

2. Copy the [docker-compose.yaml](docker-compose.yaml) to your deployment directory
3. Run: `docker compose up -d`
4. Open [http://localhost:8084](http://localhost:8084) and login with `admin` / `admin`

**Environment Variables Reference**

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `ASSETS_JWT_SECRET` | Token signing key | *(none)* | **Required.** Use a strong random string. |
| `ASSETS_JWT_EXPIRES_IN` | Token expiry duration | `24h` | Format: `24h`, `1w`, etc. |
| `ASSETS_JWT_REFRESH_BEFORE` | Auto-refresh threshold | `12h` | Refresh token before this duration before expiry. |
| `ASSETS_CACHE_TTL` | Market data cache duration | `1m` | How long to cache Yahoo Finance prices. |
| `ASSETS_CACHE_SIZE` | Number of cached items | `1000` | Increase if tracking many assets. |
| `ASSETS_DB` | Database file path | `/data/assets.db` | SQLite database location. |
| `ASSETS_PORT` | Server port | `4020` | Internal container port. |
| `ASSETS_USERNAME` | Default admin username | `admin` | Change after first login. |
| `ASSETS_PASSWORD` | Default admin password | `admin` | Change after first login. |

## Build & Run Locally

**Requirements:** [Bun runtime](https://bun.sh) (1.0+)

```bash
# Clone and setup
git clone https://github.com/venil7/assets.git
cd assets
cp .env.example .env  # Create config file
bun install           # Install dependencies
```

**Development servers** (run in separate terminals):

```bash
# Terminal 1: Backend API
bun run backend:dev   # Runs on http://localhost:4020

# Terminal 2: Frontend UI (Vite dev server)
bun run web:dev       # Runs on http://localhost:5173, proxies API to :4020
```

**Build for production:**

```bash
bun run build         # Builds both backend and frontend
```

**Testing:**

```bash
# Run all tests (requires backend:dev running in another terminal)
bun test

# Run specific package tests
cd packages/backend && bun test
cd packages/core && bun test
```

**Code quality checks:**

```bash
bun run check         # Lint and type-check all packages
```

**Build Docker image locally:**

```bash
# export DOCKER_API_VERSION=1.43
docker buildx build -t assets:local .
```

### TypeScript Monorepo Structure

This project uses Bun workspaces with three packages:

- **backend** — Express.js REST API, database queries, business logic
- **core** — Shared types, utilities, validation, domain models
- **web** — React + TypeScript frontend (Vite + SCSS)

## Development

### Environment Configuration

**Vite build-time variables** (in `packages/web`):

```bash
VITE_ASSETS_URL=http://localhost:4020  # Backend base URL (required in dev; empty string in production)
VITE_ASSET_BASENAME=/app               # URL path prefix for routing (default: /)
```

### Fill Demo User With Testing Data

```sh
rm assets.db && \
migrate -path ./.migrations -database=sqlite3://assets.db up && \
sqlite3 assets.db < prefill.sql
```

### Database Migrations

Migrations are managed with [golang-migrate](https://github.com/golang-migrate/migrate). This is **optional**—the app creates the schema automatically on first run.

If you want to manually manage migrations:

```bash
# Install migrate tool (requires Go)
go install -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Create a new migration
migrate create -ext sql -dir .migrations/ -seq -digits 3 <name>

# Apply pending migrations
migrate -path ./.migrations -database=sqlite3://assets.db up

# Rollback migrations
migrate -path ./.migrations -database=sqlite3://assets.db down <number>
```

### Testing in Docker

To run the full test suite in an isolated container:

```bash
# Build test image
docker buildx build -t assets-test -f ./Dockerfile.test .

# Run tests
docker run -it assets-test
```

## API-First Architecture

The web UI is optional. The backend exposes a **complete REST API** for any frontend or integration:

- REST endpoint documentation: [API.md](./API.md)
- Use in headless mode, CLI tools, or custom integrations
- Full authentication and multi-tenant support

## Importing Transactions

Assets supports bulk CSV import for transaction history. Most brokers and trading platforms allow you to export transaction history in CSV format.

### CSV Format

Your CSV file should have these columns:

| Column |  Format | Example |
|--------|--------|---------|
| `type` | `buy` or `sell` (case-insensitive) | `buy` |
| `quantity` | Decimal number | `65.5` |
| `price` | Decimal number | `125.50` |
| `date` | ISO 8601 datetime | `2025-05-11T06:56:39.379Z` |
| `comments` | Text (optional) | `Dividend reinvestment` |

### Example CSV

```csv
type,quantity,price,date,comments
buy,65,1,2025-05-11T06:56:39.379Z,Initial investment
sell,18,2,2025-06-12T06:56:39.379Z,Rebalancing
buy,100,125.50,2025-07-01T10:30:00Z,Monthly investment
```

> **Tip:** Export transaction history from your broker's web portal, clean it up to match this format, and upload via the UI.

## Contributing

This codebase is **hand-written, AI-free code**. 100% human.

Contributions welcome if you're comfortable with:

- **TypeScript** — Full-stack, strict type safety
- **Functional programming** — Heavy use of fp-ts, category theory patterns
- **SQL & SQLite** — Database queries and schema design
- **React** — Modern TypeScript component patterns
- **REST APIs** — Express.js, RESTful design

### Getting Started

1. [Build locally](#build--run-locally) with `bun install && bun run backend:dev`
2. Run tests: `bun test` (backend must be running)
3. Make changes, ensure `bun run check` passes (lint + type-check)
4. Submit a PR with clear description of changes

### Found a Bug?

Open a [GitHub Issue](https://github.com/venil7/assets/issues) with:

- Steps to reproduce
- Expected vs. actual behavior
- Your setup (Docker/local, OS, environment)

## Licence

Copyright &copy; 2025. All rights reserved.

Source available for inspection and personal use only.
Free to use non-commercially; commercial use reserved to the author.
No warranty or liability.
Contributions do not confer authorship or ownership rights.
