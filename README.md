# `Assets` — Personal Wealth Tracker

[![CHECKS-AND-INTEGRATION-TESTS](https://github.com/venil7/assets/actions/workflows/build-and-test.yaml/badge.svg)](https://github.com/venil7/assets/actions/workflows/build-and-test.yaml)

[![RELEASE-DOCKER-CONTAINER](https://github.com/venil7/assets/actions/workflows/build-docker-container.yaml/badge.svg)](https://github.com/venil7/assets/actions/workflows/build-docker-container.yaml)

A self-hosted net worth and portfolio manager.
Track multiple portfolios (ISA, General, Pension, Crypto, etc.) and monitor individual or total performance.
Supports any asset available via the [Yahoo Finance API](https://finance.yahoo.com/).

## Features
 - Multi user
 - Multi portfolio, total net worth
 - CSV import from your broker
 - All major currencies as base 
 - Foreign exchange return impact 
 - capital gains and unrealized return and 
 - Per transaction impact

---

<img width="235" height="500" alt="screenshot#1" src="https://github.com/user-attachments/assets/e535c660-9e40-4eae-a54b-821075ac8264" />
<img width="235" height="500" alt="screenshot#2" src="https://github.com/user-attachments/assets/6bb7314c-e858-4ff1-8a4a-29107e88cda8" />
<img width="235" height="500" alt="screenshot#3" src="https://github.com/user-attachments/assets/246dcc01-5d05-4740-9dbc-af818c9479f0" />

<img width="235" height="500" alt="screenshot#5" src="https://github.com/user-attachments/assets/994a0654-b4b3-4f7c-8935-662c38b63d5c" />
<img width="235" height="500" alt="screenshot#6" src="https://github.com/user-attachments/assets/e1268503-0adb-479a-bdb4-a46ac4714dc3" />
<img width="235" height="500" alt="screenshot#7" src="https://github.com/user-attachments/assets/90a98424-7851-4948-8e6f-98807d61a113" />

---

## Quick Start (Docker)

```sh
docker pull ghcr.io/venil7/assets:latest && \
docker run \
  -e ASSETS_JWT_SECRET=S0meSecretVa1ue \
  -e ASSETS_DB=/data/assets.db \
  -p 4020:4020 \
  -v ${PWD}:/data \
  ghcr.io/venil7/assets
```

Then navigate to [localhost:4020](localhost:4020) and login using `admin` / `admin`

## Docker Compose (Recommended)

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

## Build & Run Locally (Bun)

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

## Development Notes

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
migrate -path ./.migrations -database=sqlite3://assets.db down <number>
migrate -path ./.migrations -database=sqlite3://assets.db version
```

### Running tests

```sh
# Build a test container
docker buildx build -t assets-test -f ./Dockerfile.test .
# Run tests in a container
docker run -it assets-test
```

## API-First Design

The UI is optional — the backend exposes a full REST API.

- [API Documentation](./API.md)

## Upload External Transactions

It is possible to upload transactions for individual assets using CSV files, which can usually be downloaded from most brokers and platforms. The CSV file should have the following columns:

- _type_: The type of transaction, either "buy" or "sell" (case insensitive)
- _quantity_: The number of shares (float)
- _price_: The price per share (float)
- _date_: The date of the transaction in ISO format
- _comments_: Any comments related to the transaction (can be left blank)

Example:

```
type,quantity,price,date,comments
buy,65,1,2025-05-11T06:56:39.379Z,comment
sell,18,2,2025-06-12T06:56:39.379Z,
```

## Contributing

This codebase is 100% hand written, no AI slop. If you feel comfortable with TypeScript, [functional programming](https://amzn.eu/d/axUrvVz) and basic SQL - contributions are welcome. If you find a bug, kindly open a [Github Issue](https://github.com/venil7/assets/issues)

## Licence

Copyright &copy; 2025. All rights reserved.

Source available for inspection and personal use only.
Free to use non-commercially; commercial use reserved to the author.
No warranty or liability.
Contributions do not confer authorship or ownership rights.
