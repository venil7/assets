select id,
  username,
  admin,
  login_attempts,
  locked,
  phash,
  psalt,
  created,
  modified
from users u
limit $limit offset $offset;