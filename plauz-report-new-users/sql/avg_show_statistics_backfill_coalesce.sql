WITH dates AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '1 months', 
    CURRENT_DATE, 
    '1 day'::INTERVAL
  )::DATE AS day
)
SELECT 
  d.day,
  COALESCE(ROUND(AVG(subquery.reactions)::numeric, 1), 0) AS avg_reactions,
  COALESCE(ROUND(AVG(subquery.comments)::numeric, 1), 0) AS avg_comments,
  COALESCE(ROUND(AVG(subquery.viewers)::numeric, 1), 0) AS avg_viewers
FROM dates d
LEFT JOIN (
  SELECT DATE(show."startTime") AS show_date,
  reactions, 
  comments, 
  viewers
  FROM statistic
  INNER JOIN show ON statistic."showId" =  show."id"
  WHERE show."startTime" < NOW() 
  AND show."startTime" >= NOW() - INTERVAL '5 months'
) AS subquery ON d.day = subquery.show_date
GROUP BY d.day
ORDER BY d.day ASC;
