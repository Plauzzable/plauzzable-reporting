SELECT 
  ROUND(AVG(reactions)::numeric, 1) AS avg_reactions, 
  ROUND(AVG(comments)::numeric, 1) AS avg_comments, 
  ROUND(AVG(viewers)::numeric, 1) AS avg_viewers
FROM statistic
INNER JOIN show ON statistic."showId" =  show."id"
WHERE show."startTime" < NOW() AND
      show."startTime" >= NOW() - INTERVAL '1 day'; 