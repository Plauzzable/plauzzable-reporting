SELECT COUNT(id) AS show_count, "isFree" AS is_free
FROM show
WHERE "createdAt" < NOW() AND
      "createdAt" >= NOW() - INTERVAL '1 day'
GROUP BY "isFree";