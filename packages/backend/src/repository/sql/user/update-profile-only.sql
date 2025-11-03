update users
set username = $username,
  admin = $admin,
  login_attempts = $login_attempts,
  locked = $locked,
  modified = CURRENT_TIMESTAMP
where id = $userId;