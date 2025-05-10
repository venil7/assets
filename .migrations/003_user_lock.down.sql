-- tables

ALTER TABLE users
DROP COLUMN login_attempts;

ALTER TABLE users
DROP COLUMN locked;