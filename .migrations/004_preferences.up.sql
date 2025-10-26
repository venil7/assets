create table
  preferences (
    id integer primary key autoincrement,
    user_id integer not null,
    -- preferences start here
    base_ccy text not null,
    -- preferences end here
    created datetime default current_timestamp,
    modified datetime default current_timestamp,
    foreign key (user_id) references users (id) ON DELETE CASCADE,
    unique (user_id)
  );

--- insert defaults
INSERT INTO
  preferences (user_id, base_ccy)
SELECT
  id,
  'USD'
FROM
  users;

-- triggers
drop trigger if exists insert_user_preferences;

CREATE TRIGGER insert_user_preferences AFTER INSERT ON users FOR EACH ROW BEGIN
INSERT INTO
  preferences (user_id, base_ccy)
VALUES
  (NEW.id, 'USD');

END;

-- drop trigger if exists delete_user_preferences;
-- create trigger delete_user_preferences after delete on users for each row BEGIN
-- delete from preferences p
-- where
--   p.id = OLD.id;
-- END;