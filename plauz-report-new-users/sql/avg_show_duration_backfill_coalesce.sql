WITH dates AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '1 months', 
    CURRENT_DATE, 
    '1 day'::INTERVAL
  )::DATE AS day
)
SELECT 
  d.day,
  COALESCE(ROUND(AVG(subquery.show_duration_minutes)::numeric, 1), 0) AS average_duration_minutes
FROM dates d
LEFT JOIN (
  SELECT DATE(show."startTime") AS show_date, 
  ROUND(EXTRACT(EPOCH FROM (show."endTime" - show."startTime")) / 60) AS show_duration_minutes
  FROM show
  WHERE show."startTime" < NOW() 
  AND show."startTime" >= NOW() - INTERVAL '5 months'
  GROUP BY DATE(show."startTime"), "id"
) AS subquery ON d.day = subquery.show_date
GROUP BY d.day
ORDER BY d.day ASC;
