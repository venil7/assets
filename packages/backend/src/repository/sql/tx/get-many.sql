select *
from asset_transactions at
order by at1.date asc
limit $limit offset $offset;


-- -- select all txs before certain date
-- with selection as (
--   select *
--   from asset_transactions at1
--   where at1.asset_id = $assetId
--     and at1.user_id = $userId
--     and at1.date >= $after
--   order by at1.date asc
-- ),
-- -- select 1 tx straight after this day
-- one_more as (
--   select *
--   from asset_transactions at2
--   where at2.asset_id = $assetId
--     and at2.user_id = $userId
--     and at2.date < $after
--   order by at2.date desc
--   limit 1
-- ),
-- -- put them together and order
-- all_txs as (
--   select * from selection
--   union
--   select * from one_more
--   order by date asc
-- )
-- select *
-- from all_txs
-- limit $limit offset $offset;
