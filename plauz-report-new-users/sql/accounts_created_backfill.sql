WITH dates AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '1 months', 
    CURRENT_DATE, 
    '1 day'::INTERVAL
  )::DATE AS day
)
SELECT 
  d.day, 
  COUNT(u.id) AS number_of_accounts, 
  u."isComedian" AS is_comedian
FROM dates d
LEFT JOIN "user" u ON d.day = DATE(u."createdAt")
WHERE u."createdAt" < NOW() 
AND u."createdAt" >= NOW() - INTERVAL '1 months'
GROUP BY d.day, u."isComedian"
ORDER BY d.day ASC;
