-- 005_num_shares.down.sql

-- drop new triggers
drop trigger if exists check_holdings_before_insert_sell;
drop trigger if exists check_holdings_before_update_sell;

-- drop new views
drop view if exists transactions_ext;
drop view if exists assets_ext;
drop view if exists portfolios_ext;

-- recreate portfolios_ext from 002
create view portfolios_ext as
select
    p.*,
    coalesce(a.total_invested, 0) as total_invested,
    coalesce(a.num_assets, 0) as num_assets,
    coalesce(total_invested / sum(total_invested) over (partition by p.user_id), 0) as contribution
from
    portfolios p
    left join (
        select
            portfolio_id,
            sum(invested) as total_invested,
            count(id) as num_assets
        from
            asset_holdings
        group by
            portfolio_id
    ) as a on p.id = a.portfolio_id;

-- recreate old views from 001
create view asset_holdings as
select
    sub.*,
    case
        when sub.holdings = 0 then null
        else sub.invested / sub.holdings
    end as avg_price
from
    (
        select
            a.*,
            u.id as user_id,
            coalesce(
                sum(
                    case
                        when t.type = 'buy' then t.quantity
                        else - t.quantity
                    end
                ),
                0
            ) as holdings,
            coalesce(
                sum(
                    case
                        when t.type = 'buy' then t.quantity * t.price
                        else - t.quantity * t.price
                    end
                ),
                0
            ) as invested,
            count(t.id) as num_tx
        from
            assets a
            inner join portfolios p on p.id = a.portfolio_id
            left join transactions t on t.asset_id = a.id
            inner join users u on u.id = p.user_id
        group by
            a.id,
            a.name
    ) as sub;

create view asset_transactions as
select
    t.*,
    a.name,
    a.ticker,
    p.name as portfolio_name,
    p.description as portfolio_description,
    p.user_id
from
    transactions t
    inner join assets a on a.id = t.asset_id
    inner join portfolios p on p.id = a.portfolio_id;

create view assets_contributions as
select
    ah.*,
    coalesce(ah.invested / coalesce(pt.total_invested, 1), 0) as portfolio_contribution
from
    asset_holdings ah
    left join portfolios_ext pt on ah.portfolio_id = pt.id;

-- recreate old triggers
create trigger check_holdings_before_insert_sell before insert on transactions for each row when new.type = 'sell' begin
select
    case
        when (
            select
                holdings
            from
                asset_holdings a
            where
                id = new.asset_id
        ) < new.quantity then raise (abort, 'Insufficient holdings')
    end;

end;

create trigger check_holdings_before_update_sell before
update on transactions for each row when new.type = 'sell' begin
select
    case
        when (
            select
                holdings
            from
                asset_holdings a
            where
                id = new.asset_id
        ) < new.quantity then raise (abort, 'Insufficient holdings')
    end;

end;
