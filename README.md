## Todo
### backend
 - [x] wire up cache with yahoo calls
 - [x] portfolio chart
 - [ ] summary endoint (also chart)
 - [ ] num_transactions
 - [x] chart?range=1d
 - [x] enriched asset - base ratio
 - [x] PUT endpoints
 - [x] update tx checks sufficiend funds
 - [x] enriched portfolio
 - [x] user id passed,
 - [x] create user, change password
 - [x] create/edit asset checks ticker with yahoo
 - [x] update tests
 - [ ] SQL as comptime

### frontend
 - [ ] home screen summary
 - [ ] portfolio screen: asset amounts
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
 - [ ] better REST API documentation

## API
Portfolio API
* `POST` `/login`: get bearer token
```json
--> { username, passord }
<-- { token }
```
* `POST` `/portfolios`: Create a new portfolio
```json
--> { name, description }
<-- { id,  user_id,  name, description, created, modified, total_invested, num_assets }
```
* `GET` `/portfolios`: Retrieve all portfolios
```json
<-- [{ id,  user_id,  name, description, created, modified, total_invested, num_assets }]
```
* `GET` `/portfolios/:portfolio_id`: Retrieve a portfolio by ID
```json
<-- { id,  user_id,  name, description, created, modified, total_invested, num_assets }
```
* `DELETE` `/portfolios/:portfolio_id`: Delete a portfolio by ID
```json
<-- { id }
```
* `GET` `/portfolios/:portfolio_id/assets`: Retrieve all assets in a portfolio
```json
<-- [{ id, portfolio_id, name, ticker, created, modified, holdings, invested, avg_price, portfolio_contribution }]
```
* `POST` `/portfolios/:portfolio_id/assets`: Create a new asset in a portfolio
```json
--> { name, ticker }
<-- { id, portfolio_id, name, ticker, created, modified, holdings, invested, avg_price, portfolio_contribution }
```
* `GET` `/portfolios/:portfolio_id/assets/:asset_id`: Retrieve an asset by ID in a portfolio
```json
<-- { id, portfolio_id, name, ticker, created, modified, holdings, invested, avg_price, portfolio_contribution }
```
* `DELETE` `/portfolios/:portfolio_id/assets/:asset_id`: Delete an asset by ID in a portfolio
```json
<-- { id }
```

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