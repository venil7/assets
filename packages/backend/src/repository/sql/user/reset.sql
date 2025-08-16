update users
set login_attempts = 0
where username = $username
  and login_attempts > 0;