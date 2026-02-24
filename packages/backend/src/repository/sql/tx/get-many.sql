select
  t.id,
  asset_id,
  date,
  timestamp,
  quantity,
  quantity_ext,
  cost,
  price,
  contribution,
  stretch,
  running_holding,
  running_cost,
  running_average_price,
  cost_basis,
  running_break_even,
  realized_pnl,
  type,
  comments,
  t.created,
  t.modified,
  asset_name,
  asset_ticker,
  portfolio_name,
  portfolio_description,
  t.user_id,
  p.base_ccy as user_base_ccy
from transactions_ext t
  inner join prefs p on t.user_id = p.user_id
where t.asset_id = $assetId
  and t.user_id = $userId
order by t.date asc
limit $limit offset $offset;
