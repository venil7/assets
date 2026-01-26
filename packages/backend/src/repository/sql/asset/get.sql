SELECT A.id,
  A.portfolio_id,
  A.name,
  A.ticker,
  A.created,
  A.modified,
  A.holdings,
  A.invested,
  A.num_tx as num_txs,
  A.avg_price,
  P.base_ccy,
  A.portfolio_contribution
FROM assets_contributions A INNER JOIN prefs P
ON A.user_id = P.user_id
WHERE A.portfolio_id = $portfolioId
  AND A.user_id = $userId
  AND A.id = $assetId
LIMIT 1;