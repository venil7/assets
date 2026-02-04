-- views
drop view if exists asset_transactions;

create view
  if not exists asset_transactions as
with
  total_contr as (
    select
      asset_id,
      sum(
        case
          when t.type = 'buy' then quantity
          else - quantity
        end
      ) as total_quantity
    from
      transactions t
    group by
      asset_id
  ),
  subquery as (
    select
      t.*,
      case
        when tc.total_quantity = 0 then 0
        when t.type = 'buy' then (t.quantity / tc.total_quantity)
        else (- t.quantity / tc.total_quantity)
      end AS contribution,
      SUM(
        CASE
          WHEN t.type = 'buy' THEN t.quantity
          ELSE - t.quantity
        END
      ) OVER user_asset_txs AS holdings, --holdings post-transaction
      SUM(
        CASE
          WHEN t.type = 'buy' THEN t.quantity * t.price
          ELSE - t.quantity * t.price
        END
      ) OVER user_asset_txs AS total_invested, -- invested post-transaction
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
    window
      user_asset_txs as (
        partition by
          t.asset_id,
          p.user_id
        ORDER BY
          date rows between unbounded preceding
          and current row
      )
  )
select
  *,
  case
    when holdings = 0 then null
    else total_invested / holdings
  end as avg_price --avg unit cost post-transaction
from
  subquery;