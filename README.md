# 🪙 Assets — Personal Wealth Tracker

A self-hosted net worth and portfolio manager.
Track multiple portfolios (ISA, General, Pension, Crypto, etc.) and monitor individual or total performance.
Supports any asset available via the [Yahoo Finance API](https://finance.yahoo.com/)

---

## 🚀 Quick Start (Docker)

```sh
docker pull ghcr.io/venil7/assets:latest && \
docker run \
  -e ASSETS_JWT_SECRET=S0meSecretVa1ue \
  -e ASSETS_DB=/data/assets.db \
  -v ${PWD}:/data \
  ghcr.io/venil7/assets
```

Then navigate to [localhost:4020](localhost:4020) and login using `admin` / `admin`

## 🧩 Docker Compose (Recommended)

- Create an `.env` with individual parameters, for example:

```sh
TAG=latest # or you can try feature branch
ASSETS_CACHE_TTL=10m # how long to cache for , before hitting Yahoo Finance API
ASSETS_JWT_SECRET=S0meSecretVa1ue # a unique key for JWT token
ASSETS_JWT_EXPIRES_IN=1w # how long is JWT valid
ASSETS_JWT_REFRESH_BEFORE=5d # when to refresh JWT, before expiry
```

- Copy this [docker-compose.yaml](docker-compose.yaml)
- Run `docker compose up -d`

### Available `.env` Variables

| Variable                    | Description                    | Default           |
| --------------------------- | ------------------------------ | ----------------- |
| `ASSETS_DB`                 | Path to database               | `/data/assets.db` |
| `ASSETS_APP`                | Path to public build           | `../dist/public`  |
| `ASSETS_PORT`               | HTTP port                      | `4020`            |
| `ASSETS_CACHE_SIZE`         | Cache size                     | `1000`            |
| `ASSETS_CACHE_TTL`          | Cache TTL (`ms` or `1m`, etc.) | `1m`              |
| `ASSETS_USERNAME`           | Admin username                 | `admin`           |
| `ASSETS_PASSWORD`           | Admin password                 | `admin`           |
| `ASSETS_JWT_SECRET`         | JWT secret                     | —                 |
| `ASSETS_JWT_EXPIRES_IN`     | Token expiry                   | `24h`             |
| `ASSETS_JWT_REFRESH_BEFORE` | Refresh before expiry          | `12h`             |

- Navigate to [localhost:8084](http://localhost:8084), login using `admin` / `admin`

## 🧱 Build & Run Locally (Bun)

This software is written in TypeScript and assumes that it runs in [Bun](https://bun.sh).

- Clone repository
- Have a `.env` placed in repository root
- The following commands are available

```sh
bun install # install all dependencies

bun run check # checks the integrity of the code
bun run web:dev # runs UI in dev mode
bun run backend:dev # runs backend API in dev mode
bun run build # runs the build for both backend and frontend

bun test # runs unit and integartion tests , make sure to run backend in another terminal
```

- To build a docker container locally `$ docker buildx build -t assets .`

## 🧠 Development Notes

### build time `.env` parameters placed in `packages/web`

```sh
VITE_ASSETS_URL=http://localhost:4020 # base part of backend REST api url, this param required in VITE DEV mode, but defaults to empty '' in production
VITE_ASSET_BASENAME=/app # the beginnig part of URL before any routing
```

### sqlite database migration

- To install `migrate` tool run (requires `go`)

```sh
$ go install -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

The following `migrate` commands are available

```sh
migrate create -ext sql -dir .migrations/ -seq -digits 3 <name>
migrate -path ./.migrations -database=sqlite3://assets.db up
migrate -path ./.migrations -database=sqlite3://assets.db down
migrate -path ./.migrations -database=sqlite3://assets.db version
```

## 🧩 API-First Design

The UI is optional — the backend exposes a full REST API.

- [📘 API Documentation](./API.md)

## 🤝 Contributing

This codebase is 100% hand written, no AI slop. If you feel comfortable with TypeScript, [functional programming](https://amzn.eu/d/axUrvVz) and basic SQL - contributions are welcome. If you find a bug, kindly open a [Github Issue](https://github.com/venil7/assets/issues)
