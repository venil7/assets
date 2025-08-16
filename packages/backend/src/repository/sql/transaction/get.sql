select id,
  asset_id,
  type,
  quantity,
  price,
  date,
  created,
  modified,
  comments
from asset_transactions at
where at.id = $id
  and at.asset_id = $assetId
  and at.user_id = $userId
order by at.date desc
limit 1;