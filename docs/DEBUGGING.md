# Debugging Tips

## Timestamps

Example of March 27th 23:47 across various systems

* Send in blue logs `27-03-2023 04:47:48`
* Send in blue email preview `Mar 27, 2023 4:47 PM`
* Lambda Logs File name (Last Event Time) 2023-03-27 16:46
* Lambda log line 2023-03-27T23:46:39.850Z
* CloudWatch metrics 23:46

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