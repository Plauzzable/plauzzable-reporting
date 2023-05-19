SELECT "id", "email"
FROM "user"
WHERE "email" = ANY ($1);