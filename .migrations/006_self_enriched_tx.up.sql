--  create view
drop view if exists transactions_ext;

create view
  if not exists transactions_ext as
with
  quantity_ext_cte as (
    select
      *,
      case
        when type = 'buy' then quantity
        else - quantity
      end as quantity_ext
    from
      transactions
  ),
  running_holding_cte as (
    select
      *,
      case
      -- if less then one ten millionth
        when sum(quantity_ext) over up_to_here < 1e-7 then 0
        else sum(quantity_ext) over up_to_here
      end as running_holding
    from
      quantity_ext_cte
    window
      up_to_here as (
        partition by
          asset_id
        order by
          date,
          id rows between unbounded preceding
          and current row
      )
  ),
  stretch_cte as (
    select
      *,
      sum(
        case
          when running_holding <= 0 then 1
          else 0
        end
      ) over stretch_w as stretch
    from
      running_holding_cte
    window
      stretch_w as (
        partition by
          asset_id
        order by
          date,
          id rows between unbounded preceding
          and current row
      )
  ),
  stretch_ext_cte as (
    select
      *,
      lag (stretch, 1, 0) over stretch_w as stretch_ext
    from
      stretch_cte
    window
      stretch_w as (
        partition by
          asset_id
        order by
          date,
          id rows between unbounded preceding
          and current row
      )
  ),
  running_cost_cte as (
    select
      *,
      quantity_ext / max(running_holding) over entire_stretch as contribution,
      case
        when sum(quantity_ext * price) over true_stretch <= 1e-7 then 0
        else sum(quantity_ext * price) over true_stretch
      end as running_cost,
      sum(quantity_ext * price) over true_stretch / running_holding as raw_avg_price
    from
      stretch_ext_cte
    window
      true_stretch as (
        partition by
          asset_id,
          stretch_ext
        order by
          date,
          id rows between unbounded preceding
          and current row
      ),
      entire_stretch as (
        partition by
          asset_id,
          stretch_ext
        order by
          date,
          id range between unbounded preceding
          and unbounded following
      )
  ),
  avg_price_cte as (
    select
      *,
      round(sum(contribution) over true_stretch, 9) as running_contribution,
      case
        when quantity_ext < 0 then lag (raw_avg_price, 1) over true_stretch
        else raw_avg_price
      end as running_average_price,
      stretch_ext = max(stretch_ext) over extended_stretch
      and last_value (running_holding) over extended_stretch > 0 as final_stretch
    from
      running_cost_cte
    window
      true_stretch as (
        partition by
          asset_id,
          stretch_ext
        order by
          date,
          id rows between unbounded preceding
          and current row
      ),
      extended_stretch as (
        partition by
          asset_id
        order by
          date,
          id range between unbounded preceding
          and unbounded following
      )
  ),
  txs_ext_cte as (
    select
      *,
      case
        when quantity_ext > 0
        and not final_stretch then last_value (price) over true_stretch
        when quantity_ext < 0 then price
        else null
      end as sold_price,
      case
        when quantity_ext > 0
        and not final_stretch then
        -- sold price * qty - cost_basis
        last_value (price) over true_stretch * quantity - (running_average_price * quantity)
        when quantity_ext < 0 then price * quantity - running_average_price * quantity
        else null
      end as pnl,
      strftime ('%s', date) as timestamp,
      quantity_ext * price as cost,
      stretch_ext as stretch,
      quantity * running_average_price as cost_basis,
      running_average_price * running_holding as running_break_even,
      case
        when quantity_ext < 0 then (price - running_average_price) * quantity
        else 0
      end as realized_pnl
    from
      avg_price_cte
    window
      true_stretch as (
        partition by
          asset_id,
          stretch_ext
        order by
          date,
          id range between unbounded preceding
          and unbounded following
      )
  )
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
  t.running_contribution,
  t.stretch,
  t.final_stretch,
  t.sold_price,
  t.pnl,
  t.pnl / t.cost_basis as pnl_pct,
  t.sold_price * t.quantity as value,
  t.realized_pnl,
  t.cost,
  t.cost_basis,
  t.contribution,
  t.comments,
  t.created,
  t.modified,
  a.name as asset_name,
  a.ticker as asset_ticker,
  p.name as portfolio_name,
  p.description as portfolio_description,
  p.user_id
from
  txs_ext_cte t
  inner join assets a on a.id = t.asset_id
  inner join portfolios p on p.id = a.portfolio_id;

-- assets ext
drop view if exists assets_ext;

create view
  if not exists assets_ext as
with
  asset_tx_ids as (
    select
      t.id,
      t.asset_id
    from
      transactions t
    where
      t.id = (
        select
          id
        from
          transactions t2
        where
          t2.asset_id = t.asset_id
        order by
          t2.date desc,
          t2.id desc
        limit
          1
      )
  ),
  tx_running as (
    select
      te.asset_id,
      te.running_holding as holdings,
      te.running_cost as invested,
      te.running_average_price as avg_price,
      te.running_break_even as break_even
    from
      transactions_ext te
      join asset_tx_ids atx on te.id = atx.id
  ),
  tx_aggregates as (
    select
      asset_id,
      sum(realized_pnl) as realized_pnl,
      count(id) as num_txs,
      max(date) as last_activity,
      max(timestamp) as last_activity_ts
    from
      transactions_ext
    group by
      asset_id
  ),
  assets_info as (
    select
      a.*,
      p.user_id,
      coalesce(tr.holdings, 0) as holdings,
      coalesce(tr.invested, 0) as invested,
      coalesce(tr.avg_price, 0) as avg_price,
      coalesce(tr.break_even, 0) as break_even,
      coalesce(ta.realized_pnl, 0) as realized_pnl,
      coalesce(ta.num_txs, 0) as num_txs,
      ta.last_activity,
      ta.last_activity_ts
    from
      assets a
      left join tx_running tr on a.id = tr.asset_id
      left join tx_aggregates ta on a.id = ta.asset_id
      inner join portfolios p on p.id = a.portfolio_id
  )
select
  *
from
  assets_info;

-- portfolios_ext
drop view if exists portfolios_ext;

create view
  portfolios_ext as
with
  portfolio_assets as (
    select
      portfolio_id,
      count(id) as num_assets
    from
      assets_ext
    group by
      portfolio_id
  )
select
  p.*,
  coalesce(pa.num_assets, 0) as num_assets
from
  portfolios p
  left join portfolio_assets as pa on p.id = pa.portfolio_id;