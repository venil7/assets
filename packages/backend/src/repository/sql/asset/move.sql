UPDATE assets
SET portfolio_id = $newPortfolioId
WHERE id = $assetId
  AND EXISTS (
    SELECT 1
    FROM portfolios p_old
    JOIN portfolios p_new ON p_old.user_id = p_new.user_id
    WHERE p_old.id = $portfolioId
      AND p_new.id = $newPortfolioId
      AND p_old.user_id = $userId
  );