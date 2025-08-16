delete from portfolios
where id = $id
  AND user_id = $userId;