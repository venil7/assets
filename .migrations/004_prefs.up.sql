create table
  prefs (
    id integer primary key autoincrement,
    user_id integer not null,
    -- prefs start here
    base_ccy text CHECK (
      base_ccy IN (
        'USD',
        'GBP',
        'EUR',
        'CAD',
        'AUD',
        'CHF',
        'SEK',
        'NOK',
        'DKK',
        'NZD',
        'JPY'
      )
    ) not null default 'USD',
    -- prefs end here
    created datetime default current_timestamp,
    modified datetime default current_timestamp,
    foreign key (user_id) references users (id) ON DELETE CASCADE,
    unique (user_id)
  );

--- insert defaults
INSERT INTO
  prefs (user_id, base_ccy)
SELECT
  id,
  'USD'
FROM
  users;

-- triggers
drop trigger if exists insert_user_prefs;

CREATE TRIGGER insert_user_prefs AFTER INSERT ON users FOR EACH ROW BEGIN
INSERT INTO
  prefs (user_id, base_ccy)
VALUES
  (NEW.id, 'USD');

END;