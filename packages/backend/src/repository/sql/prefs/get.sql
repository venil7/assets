select id,
  base_ccy,
  additional
from prefs p
where p.user_id = $userId
limit 1;