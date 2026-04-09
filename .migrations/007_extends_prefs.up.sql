ALTER TABLE prefs
RENAME TO prefs_old;

CREATE TABLE
  prefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    base_ccy TEXT NOT NULL DEFAULT 'USD',
    additional TEXT NOT NULL DEFAULT '{}',
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (user_id)
  );

INSERT INTO
  prefs (
    id,
    user_id,
    base_ccy,
    additional,
    created,
    modified
  )
SELECT
  id,
  user_id,
  base_ccy,
  '{}' AS additional,
  created,
  modified
FROM
  prefs_old;

DROP TRIGGER IF EXISTS insert_user_prefs;

CREATE TRIGGER insert_user_prefs AFTER INSERT ON users FOR EACH ROW BEGIN
INSERT INTO
  prefs (user_id, base_ccy)
VALUES
  (NEW.id, 'USD');

END;

DROP TABLE prefs_old;