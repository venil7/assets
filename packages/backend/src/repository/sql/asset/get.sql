SELECT id,
  portfolio_id,
  name,
  ticker,
  created,
  modified,
  holdings,
  invested,
  avg_price,
  portfolio_contribution
FROM assets_contributions A
WHERE A.id = $id
  AND A.portfolio_id = $portfolioId
  AND A.user_id = $userId
LIMIT 1;