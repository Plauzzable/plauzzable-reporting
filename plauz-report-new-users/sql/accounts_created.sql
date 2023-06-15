SELECT COUNT(id) AS number_of_accounts,
       "user"."isComedian" AS is_comedian
FROM "user"
WHERE "createdAt" < NOW() AND
      "createdAt" >= NOW() - INTERVAL '1 day'
GROUP BY "user"."isComedian";