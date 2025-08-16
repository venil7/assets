UPDATE portfolios
SET name = $name,
  description = $description,
  modified = CURRENT_TIMESTAMP
WHERE id = $portfolioId
  AND user_id = $userId;