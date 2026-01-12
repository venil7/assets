select id,
  asset_id,
  type,
  quantity,
  price,
  date,
  created,
  modified,
  comments,
  holdings,
  total_invested,
  avg_price, $orderDir
from asset_transactions at
where at.asset_id = $assetId
  and at.user_id = $userId
  and at.date >= $after
order by at.date asc
limit $limit offset $offset;