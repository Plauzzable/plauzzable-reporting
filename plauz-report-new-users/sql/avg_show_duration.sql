SELECT
    ROUND(AVG(show_duration_minutes)::numeric, 1) AS average_duration_minutes
FROM (
    SELECT ROUND(EXTRACT(EPOCH FROM ("endTime" - "startTime")) / 60) as show_duration_minutes
	FROM show
    WHERE show."startTime" < NOW() AND
          show."startTime" >= NOW() - INTERVAL '1 day'
	GROUP BY "id"
	
) AS subquery;
