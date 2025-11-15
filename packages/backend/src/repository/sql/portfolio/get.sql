select p.*
from portfolios_ext p
where p.id = $portfolioId
  and p.user_id = $userId
limit 1;