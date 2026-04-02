update prefs
set
  base_ccy = $base_ccy,
  additional = $additional,
  modified = datetime('subsec')
where user_id = $userId;