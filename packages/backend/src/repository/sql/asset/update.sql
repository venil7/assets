UPDATE assets
SET name = $name,
  ticker = $ticker,
  modified = CURRENT_TIMESTAMP
WHERE id = $assetId
  and portfolio_id = $portfolioId