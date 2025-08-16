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
where u.username = $username
  and u.login_attempts < 3
  and u.locked < 1
limit 1;