## Todo
### backend
 - [x] wire up cache with yahoo calls
 - [x] portfolio chart
 - [ ] summary endoint (also chart)
 - [ ] num_transactions
 - [ ] chart?range=1d
 - [x] enriched asset - base ratio
 - [x] PUT endpoints
 - [x] update tx checks sufficiend funds
 - [x] enriched portfolio
 - [x] user id passed,
 - [x] create user, change password
 - [x] create/edit asset checks ticker with yahoo
 - [x] update tests

### frontend
 - [ ] home screen summary
 - [ ] user management
 - [ ] profile management
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
```
migrate create -ext sql -dir .migrations/ -seq -digits 3 <name>
migrate migrate -path ./.migrations -database=sqlite3://test.db
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

This project was created using `bun init` in bun v1.1.28. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
