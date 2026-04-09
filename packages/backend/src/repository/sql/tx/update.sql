UPDATE transactions
SET type = $type,
  quantity = $quantity,
  price = $price,
  comments = $comments,
  date = $date,
  modified = datetime('subsec')
WHERE id = $txId
  and asset_id = $assetId;