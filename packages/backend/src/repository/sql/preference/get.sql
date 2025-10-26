select id, base_ccy
from preferences p
where p.user_id = $userId
limit 1;