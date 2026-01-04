-- views
drop view if exists asset_transactions;

create view
  if not exists asset_transactions as
with
  subquery as (
    select
      t.*,
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