-- views
drop view if exists asset_transactions;

create view
  if not exists asset_transactions as
with
  total_contr as (
    select
      asset_id,
      sum(quantity) as total_quantity
    from
      transactions t
    group by
      asset_id
  ),
  subquery as (
    select
      t.*,
      case
        when t.type = 'buy' then (t.quantity / tc.total_quantity)
        else 0
      end AS contribution,
      SUM(
        CASE
          WHEN t.type = 'buy' THEN t.quantity
          ELSE - t.quantity
        END
      ) OVER (
        partition by
          t.asset_id,
          p.user_id
        ORDER BY
          date
      ) AS holdings,
      SUM(
        CASE
          WHEN t.type = 'buy' THEN t.quantity * t.price
          ELSE - t.quantity * t.price
        END
      ) OVER (
        partition by
          t.asset_id,
          p.user_id
        ORDER BY
          date
      ) AS total_invested,
      a.name,
      a.ticker,
      p.name as portfolio_name,
      p.description as portfolio_description,
      p.user_id
    from
      transactions t
      inner join total_contr tc on tc.asset_id = t.asset_id
      inner join assets a on a.id = t.asset_id
      inner join portfolios p on p.id = a.portfolio_id
  )
select
  *,
  case
    when holdings = 0 then null
    else total_invested / holdings
  end as avg_price
from
  subquery;