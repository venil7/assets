select id,
  asset_id,
  type,
  quantity,
  quantity_ext, -- quantity with buy/sell sign
  price,
  date,
  comments,
  holdings,
  total_invested,
  avg_price,
  contribution,
  created,
  modified
from transactions_ext at
where at.asset_id = $assetId
  and at.user_id = $userId
order by at.date asc
limit $limit offset $offset;
