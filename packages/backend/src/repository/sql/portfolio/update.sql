UPDATE portfolios
SET name = $name,
  description = $description,
  modified = datetime('subsec')
WHERE id = $portfolioId
  AND user_id = $userId;