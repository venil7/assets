delete from transactions
where id in (
    select at.id
    from transactions_ext at
    where at.asset_id = $assetId and
      at.user_id = $userId
  );