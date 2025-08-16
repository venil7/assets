select phash,
  psalt,
  created,
  modified,
  id,
  username,
  admin,
  login_attempts,
  locked
from users u
where u.id = $userId
limit 1;