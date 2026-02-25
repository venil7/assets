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
          id,
          date
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
          id,
          date
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
          id,
          date
      )
  ),
  running_cost_cte as (
    select
      *,
      quantity_ext / max(running_holding) over true_stretch as contribution,
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
          id,
          date
      )
  ),
  avg_price_cte as (
    select
      *,
      case
        when quantity_ext < 0 then lag (raw_avg_price, 1) over true_stretch
        else raw_avg_price
      end as running_average_price
    from
      running_cost_cte
    window
      true_stretch as (
        partition by
          asset_id,
          stretch_ext
      )
  ),
  txs_ext as (
    select
      id,
      asset_id,
      date,
      strftime ('%s', date) as timestamp,
      quantity,
      quantity_ext,
      quantity_ext * price as cost,
      price,
      contribution,
      stretch_ext as stretch,
      running_holding,
      running_cost,
      running_average_price,
      quantity_ext * running_average_price as cost_basis,
      running_average_price * running_holding as running_break_even,
      case
        when quantity_ext < 0 then (price - running_average_price) * quantity
        else 0
      end as realized_pnl,
      type,
      comments,
      created,
      modified
    from
      avg_price_cte
  )
select
  t.*,
  a.name as asset_name,
  a.ticker as asset_ticker,
  p.name as portfolio_name,
  p.description as portfolio_description,
  p.user_id
from
  txs_ext t
  inner join assets a on a.id = t.asset_id
  inner join portfolios p on p.id = a.portfolio_id
order by
  timestamp desc;