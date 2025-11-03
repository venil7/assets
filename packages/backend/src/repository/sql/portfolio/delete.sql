delete from portfolios
where id = $portfolioId
  AND user_id = $userId;