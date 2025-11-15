delete from assets
where id in (
    select A.id
    from assets A
      inner join portfolios P ON P.id = A.portfolio_id
    where A.id = $assetId
      and P.id = $portfolioId
      AND P.user_id = $userId
    limit 1
  );