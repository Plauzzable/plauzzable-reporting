SELECT
    ROUND(AVG(subscriber_count)::numeric, 1) AS average_subscribers
FROM (
    SELECT COUNT("fanId") AS subscriber_count FROM  subscriber 
	INNER JOIN show ON subscriber."showId" =  show."id"
    WHERE show."startTime" < NOW() AND
          show."startTime" >= NOW() - INTERVAL '1 day'
	GROUP BY "showId"
) AS subquery;
