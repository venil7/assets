-- views
-- deleting views no longer in use
drop view if exists assets_contributions;

drop view if exists asset_transactions;

drop view if exists asset_holdings;

-- transactions_ext
drop view if exists transactions_ext;

create view
  if not exists transactions_ext as
with
  txs_ext as (
    select
      *,
      case
        when type = 'buy' then quantity
        else 0 - quantity
      end as quantity_ext
    from
      transactions
  ),
  total_contr as (
    select
      asset_id,
      sum(quantity_ext) as total_quantity
    from
      txs_ext
    group by
      asset_id
  )
select
  t.*,
  sum(quantity_ext) over upto_tx as holdings,
  sum(quantity_ext * price) over upto_tx as total_invested,
  coalesce(
    sum(
      case
        when type = 'buy' then quantity * price
        else 0
      end
    ) over upto_tx / sum(
      case
        when type = 'buy' then quantity
        else 0
      end
    ) over upto_tx,
    0
  ) as avg_price,
  case
    when tc.total_quantity = 0 then 0
    else quantity_ext / tc.total_quantity
  end AS contribution,
  a.name,
  a.ticker,
  p.name as portfolio_name,
  p.description as portfolio_description,
  p.user_id
from
  txs_ext t
  join total_contr tc on t.asset_id = tc.asset_id
  inner join assets a on a.id = t.asset_id
  inner join portfolios p on p.id = a.portfolio_id
window
  upto_tx as (
    partition by
      t.asset_id
    order by
      date ROWS BETWEEN UNBOUNDED PRECEDING
      AND CURRENT ROW
  )
order by
  date;

-- asset holdings, rename -> assets_ext
create view
  if not exists assets_ext as
with
  avg_unit_cost as (
    select
      asset_id,
      sum(quantity * price) / sum(quantity) as avg_price
    from
      transactions
    where
      type = 'buy'
    group by
      asset_id
  ),
  tx_stats as (
    select
      asset_id,
      sum(quantity_ext) as holdings,
      count(*) as num_txs
    from
      transactions_ext
    group by
      asset_id
  )
select
  a.*,
  u.id as user_id,
  coalesce(t.holdings, 0) as holdings,
  coalesce(t.holdings * c.avg_price, 0) as invested,
  coalesce(t.num_txs, 0) as num_txs,
  c.avg_price
from
  assets a
  inner join portfolios p on p.id = a.portfolio_id
  left join avg_unit_cost c on a.id = c.asset_id
  left join tx_stats t on a.id = t.asset_id
  inner join users u on u.id = p.user_id;

-- portfolios_ext
drop view if exists portfolios_ext;

create view
  portfolios_ext as
with
  portfolio_assets as (
    select
      portfolio_id,
      sum(invested) as total_invested,
      count(id) as num_assets
    from
      assets_ext
    group by
      portfolio_id
  )
select
  p.*,
  coalesce(pa.total_invested, 0) as total_invested,
  coalesce(pa.num_assets, 0) as num_assets,
  coalesce(
    pa.total_invested / sum(pa.total_invested) over user_portfolios,
    0
  ) as contribution
from
  portfolios p
  left join portfolio_assets as pa on p.id = pa.portfolio_id
window
  user_portfolios as (
    partition by
      p.user_id
  );

-- redefine triggers with new view names
drop trigger if exists check_holdings_before_insert_sell;

create trigger check_holdings_before_insert_sell before insert on transactions for each row when new.type = 'sell' begin
select
  case
    when (
      select
        holdings
      from
        assets_ext a
      where
        id = new.asset_id
    ) < new.quantity then raise (abort, 'Insufficient holdings')
  end;

end;

drop trigger if exists check_holdings_before_update_sell;

create trigger check_holdings_before_update_sell before
update on transactions for each row when new.type = 'sell' begin
select
  case
    when (
      select
        holdings
      from
        assets_ext a
      where
        id = new.asset_id
    ) < new.quantity then raise (abort, 'Insufficient holdings')
  end;

end;