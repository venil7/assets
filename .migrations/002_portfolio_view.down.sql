-- 002_portfolio_view.down.sql

-- revert views to previous state
drop view if exists portfolios_ext;

create view portfolios_ext as
select
    p.*,
    coalesce(a.total_invested, 0) as total_invested,
    coalesce(a.num_assets, 0) as num_assets
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

-- remove comments column
alter table transactions
drop column comments;
