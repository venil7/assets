-- tables

ALTER TABLE users
ADD COLUMN login_attempts integer DEFAULT 0;

ALTER TABLE users
ADD COLUMN locked integer DEFAULT 0 CHECK(locked IN (0, 1));