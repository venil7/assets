update users
set username = $username,
  admin = $admin,
  login_attempts = $login_attempts,
  locked = $locked,
  modified = datetime('subsec')
where id = $userId;