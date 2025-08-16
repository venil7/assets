update users
set login_attempts = login_attempts + 1
where username = $username;