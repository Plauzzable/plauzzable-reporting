# Debugging Tips

## Upcoming Shows

How many minutes until the next plauzzable show?

    SELECT 
        "show"."title",                
        Extract(epoch FROM ("startTime" - NOW())) / 60 AS minutes,
        "show"."id",
        "show"."userId",
        "show"."startTime",
        NOW()
    FROM "show"
    WHERE "startTime" > NOW()
    ORDER BY "startTime" ASC
    LIMIT 1;