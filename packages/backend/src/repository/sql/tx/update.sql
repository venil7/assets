UPDATE transactions
SET type = $type,
  quantity = $quantity,
  price = $price,
  comments = $comments,
  date = $date,
  modified = CURRENT_TIMESTAMP
WHERE id = $txId
  and asset_id = $assetId;