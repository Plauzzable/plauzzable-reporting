SELECT COUNT(id) AS number_of_accounts,
       "user"."isComedian" AS is_comedian
FROM "user"
GROUP BY "user"."isComedian";