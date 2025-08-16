select p.*
from portfolios_ext p
where p.user_id = $userId
limit $limit offset $offset;