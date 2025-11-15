select
  id,
  username,
  admin,
  psalt,
  phash,
  login_attempts,
  locked,
  created,
  modified
from users u
where u.username = $username
  and u.login_attempts < 3
  and u.locked < 1
limit 1;