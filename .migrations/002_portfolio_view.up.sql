-- tables
ALTER TABLE transactions
ADD COLUMN comments text DEFAULT "";

-- views
drop view if exists portfolios_ext;
CREATE VIEW portfolios_ext as
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