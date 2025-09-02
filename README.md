## Todo
### backend
 - [x] wire up cache with yahoo calls
 - [x] portfolio chart
 - [x] asset - num_transactions
 - [x] chart?range=1d
 - [x] enriched asset - base ratio
 - [x] PUT endpoints
 - [x] update tx checks sufficiend funds
 - [x] enriched portfolio
 - [x] user id passed,
 - [x] create user, change password
 - [x] create/edit asset checks ticker with yahoo
 - [x] update tests
 - [x] SQL as comptime
 - [x] summary endoint (with chart)
 - [x] fix chart combining
 - [ ] serverside sessions

### frontend
 - [x] home screen summary (chart)
 - [ ] chart to show percentage growth for selected range
 - [x] fix chart
 - [x] asset page, to show totals
 - [x] portfolio screen: asset amounts
 - [x] user management
 - [x] profile management
 - [x] basic chart
 - [x] currency symbol asset/tx
 - [x] non epmty string decoder
 - [x] select<T> based on react-select
 - [x] portfolio details
 - [x] asset details
 - [x] breadcrumb
 - [x] login screen
 - [x] modal box as promise,
 - [x] add/edit everything
 - [x] delete everything
 - [x] better REST API documentation

## API
 - [REST API](./API.md)

### create migration
```sh
migrate create -ext sql -dir .migrations/ -seq -digits 3 <name>
migrate -path ./.migrations -database=sqlite3://assets.db up
migrate -path ./.migrations -database=sqlite3://assets.db down
migrate -path ./.migrations -database=sqlite3://assets.db version
```

### run tests

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## configurable env variables

### runtime parameters
 - `ASSETS_DB` - path to database
 - `ASSETS_APP` - path to public (../dist/public)
 - `ASSETS_PORT` - listen on port (must be number)
 - `ASSETS_CACHE_SIZE` - cache size (number), default 1000
 - `ASSETS_CACHE_TTL` - cache time to live in `ms` format, default `1m`
 - `ASSETS_USERNAME` - initialize with admin login, default admin
 - `ASSETS_PASSWORD` - initialize with admin password, default admin
 - `ASSETS_JWT_SECRET` - a secret to encrypt/sign jwt
 - `ASSETS_JWT_EXPIRES_IN` - expiration for token in `ms` format, default `24h`
 - `ASSETS_JWT_REFRESH_BEFORE` - refresh token X before expiry in ms format, default `12h`

### build time parameters (goes int .env in web)
 - `VITE_ASSETS_URL=http://localhost:4020` - he base part of backend REST api url, this param required in VITE DEV mode, but defaults to empty '' in production
 - `VITE_ASSET_BASENAME=/ap`p - the beginnig part of URL before any routing

## running in prod
```bash
TAG=latest \
ASSETS_JWT_SECRET=some-secret \
docker compose up -d
```