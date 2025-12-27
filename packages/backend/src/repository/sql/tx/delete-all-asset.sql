delete from transactions
where id in (
    select at.id
    from asset_transactions at
    where at.asset_id = $assetId and
      at.user_id = $userId
  );