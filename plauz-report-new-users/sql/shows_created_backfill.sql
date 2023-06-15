WITH dates AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '1 months', 
    CURRENT_DATE, 
    '1 day'::INTERVAL
  )::DATE AS day
)
SELECT d.day, COUNT(s.id) AS show_count, s."isFree" AS is_free
FROM dates d
LEFT JOIN show s ON d.day = DATE(s."createdAt")
WHERE s."createdAt" < NOW() 
AND s."createdAt" >= NOW() - INTERVAL '1 months'
GROUP BY d.day, s."isFree"
ORDER BY s."isFree", d.day ASC;
