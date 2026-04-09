UPDATE assets
SET name = $name,
  ticker = $ticker,
  modified = datetime('subsec')
WHERE id = $assetId
  and portfolio_id = $portfolioId