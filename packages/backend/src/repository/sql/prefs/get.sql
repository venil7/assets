select id, base_ccy
from prefs p
where p.user_id = $userId
limit 1;