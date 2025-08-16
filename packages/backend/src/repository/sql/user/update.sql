update users
set username = $username,
  phash = $phash,
  psalt = $psalt,
  admin = $admin,
  login_attempts = $login_attempts,
  locked = $locked
where id = $userId;