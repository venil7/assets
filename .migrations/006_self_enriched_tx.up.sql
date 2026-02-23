create table
  transactions (
    id integer primary key autoincrement,
    asset_id integer not null,
    type text not null check (type in ('buy', 'sell')),
    quantity real not null,
    price real not null,
    date date default current_timestamp,
    comments varchar,
    created datetime default current_timestamp,
    modified datetime default current_timestamp
  );

---
insert into
  transactions (asset_id, type, quantity, price)
values
  (1, 'buy', 1, 100),
  (1, 'buy', 2, 110),
  (1, 'buy', 3, 120),
  (1, 'sell', 6, 130),
  (1, 'buy', 1, 100),
  (1, 'buy', 2, 110),
  (1, 'buy', 3, 120),
  (1, 'sell', 2, 130);

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
      sum(quantity_ext) over up_to_here as running_holding
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
          when running_holding = 0 then 1
          else 0
        end
      ) over (
        partition by
          asset_id
        order by
          id,
          date
      ) as stretch
    from
      running_holding_cte
  ),
  stretch_ext_cte as (
    select
      *,
      lag (stretch, 1, 0) over (
        partition by
          asset_id
        order by
          id,
          date
      ) as stretch_ext
    from
      stretch_cte
  ),
  running_cost_cte as (
    select
      *,
      quantity_ext / max(running_holding) over (
        partition by
          asset_id,
          stretch_ext
      ) as contribution,
      sum(quantity_ext * price) over (
        partition by
          asset_id,
          stretch_ext
        order by
          id,
          date
      ) as running_cost,
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
        when quantity_ext < 0 then lag (raw_avg_price, 1) over (
          partition by
            asset_id,
            stretch_ext
        )
        else raw_avg_price
      end as running_average_price
    from
      running_cost_cte
  ),
  cost_cte as (
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
  *
from
  cost_cte;

--- use
select
  *
from
  transactions_ext;