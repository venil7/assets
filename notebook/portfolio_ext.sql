with
  portfolio_assets as (
    select
      portfolio_id,
      count(id) as num_assets
    from
      assets_ext
    group by
      portfolio_id
  )
select
  p.*,
  coalesce(pa.num_assets, 0) as num_assets
from
  portfolios p
  left join portfolio_assets as pa on p.id = pa.portfolio_id;