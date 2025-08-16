select p.*
from portfolios_ext p
where p.id = $id
  and p.user_id = $userId
limit 1;