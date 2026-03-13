SELECT
  A.id,
  A.portfolio_id,
  A.ticker,
  A.name,
  A.holdings,
  A.invested,
  A.avg_price,
  A.break_even,
  A.realized_pnl,
  A.num_txs,
  A.last_activity,
  A.last_activity_ts,
  A.user_id,
  P.base_ccy,
  A.created,
  A.modified
FROM assets_ext A
  INNER JOIN prefs P ON A.user_id = P.user_id
WHERE A.portfolio_id = $portfolioId
  AND A.user_id = $userId
  AND A.id = $assetId
LIMIT 1;