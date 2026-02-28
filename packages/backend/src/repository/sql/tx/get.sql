select
  t.id,
  t.asset_id,
  t.type,
  t.quantity,
  t.quantity_ext,
  t.price,
  t.date,
  t.timestamp,
  t.running_holding,
  t.running_cost,
  t.running_average_price,
  t.running_break_even,
  t.stretch,
  t.final_stretch,
  t.sold_price,
  t.pnl,
  t.pnl_pct,
  t.realized_pnl,
  t.value,
  t.cost,
  t.cost_basis,
  t.contribution,
  t.comments,
  t.created,
  t.modified,
  t.asset_name,
  t.asset_ticker,
  t.portfolio_name,
  t.portfolio_description,
  t.user_id,
  p.base_ccy as user_base_ccy
from transactions_ext t
  inner join prefs p on t.user_id = p.user_id
where t.id = $txId
  and t.asset_id = $assetId
  and t.user_id = $userId
order by t.date desc
limit 1;