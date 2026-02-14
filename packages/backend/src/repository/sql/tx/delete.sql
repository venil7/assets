delete from transactions
where id in (
    select at.id
    from transactions_ext at
    where at.id = $txId
      and at.user_id = $userId
    limit 1
  );