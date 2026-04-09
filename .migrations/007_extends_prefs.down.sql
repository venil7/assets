-- 007_extends_prefs.down.sql

-- recreate old prefs table
drop table if exists prefs_old;

create table prefs_old (
  id integer primary key autoincrement,
  user_id integer not null,
  base_ccy text check (
    base_ccy in (
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
  created datetime default current_timestamp,
  modified datetime default current_timestamp,
  foreign key (user_id) references users (id) on delete cascade,
  unique (user_id)
);

-- migrate data back
insert into prefs_old (id, user_id, base_ccy, created, modified)
select id, user_id, base_ccy, created, modified
from prefs;

-- drop new prefs table
drop table prefs;

-- rename old back to prefs
alter table prefs_old rename to prefs;

-- recreate trigger
drop trigger if exists insert_user_prefs;

create trigger insert_user_prefs after insert on users for each row begin
insert into prefs (user_id, base_ccy)
values (new.id, 'USD');
end;
