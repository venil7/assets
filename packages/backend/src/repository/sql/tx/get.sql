select id,
  asset_id,
  type,
  quantity,
  price,
  date,
  comments,
  holdings,
  total_invested,
  avg_price,
  contribution,
  created,
  modified
from asset_transactions at
where at.id = $txId
  and at.asset_id = $assetId
  and at.user_id = $userId
order by at.date desc
limit 1;