with
  tx_aggregates as (
    select
      id,
      asset_id,
      running_holding as holding,
      running_cost as cost,
      running_average_price as avg_price,
      running_break_even as break_even,
      sum(realized_pnl) as realized_pnl,
      max(date) as last_activity,
      max(timestamp) as last_activity_ts,
      count(id) as num_txs
    from
      transactions_ext
    group by
      asset_id
    window
      asset_window as (
        partition by
          asset_id
        order by
          stretch,
          timestamp,
          id
      )
  ),
  assets_info as (
    select
      a.*,
      p.user_id,
      coalesce(t.holding, 0) as holding,
      coalesce(t.cost, 0) as invested,
      coalesce(t.avg_price, 0) as avg_price,
      coalesce(t.break_even, 0) as break_even,
      coalesce(t.realized_pnl, 0) as realized_pnl,
      coalesce(t.num_txs, 0) as num_txs,
      t.last_activity,
      t.last_activity_ts
    from
      assets a
      left join tx_aggregates t on a.id = t.asset_id
      inner join portfolios p on p.id = a.portfolio_id
  )
select
  *
from
  assets_info;