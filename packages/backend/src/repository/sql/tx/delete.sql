delete from transactions
where id in (
    select at.id
    from asset_transactions at
    where at.id = $txId
      and at.user_id = $userId
    limit 1
  );