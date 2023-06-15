SELECT COUNT(id) AS show_count, "isFree" AS is_free
FROM show
GROUP BY "isFree";