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

-- where id=176;