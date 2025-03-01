## API
Portfolio API
* `POST` `/portfolio`: Create a new portfolio
* `GET` `/portfolio`: Retrieve all portfolios
* `GET` `/portfolio/:portfolio_id`: Retrieve a portfolio by ID
* `DELETE` `/portfolio/:portfolio_id`: Delete a portfolio by ID
* `GET` `/portfolio/:portfolio_id/assets`: Retrieve all assets in a portfolio
* `POST` `/portfolio/:portfolio_id/assets`: Create a new asset in a portfolio
* `GET` `/portfolio/:portfolio_id/assets/:asset_id`: Retrieve an asset by ID in a portfolio
* `DELETE` `/portfolio/:portfolio_id/assets/:asset_id`: Delete an asset by ID in a portfolio

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
