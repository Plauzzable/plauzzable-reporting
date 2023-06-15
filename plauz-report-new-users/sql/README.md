# README

Various notes on the SQL files in this directory.

## Shows createdAt versus startTime

Some Admin Analytics are based on aggregating a day's worth of data based on a show's createdAt date/time.
Other are based on the startTime. This is an important decision to make when designing the analytic.

## backfill

I have checked in SQL files useful for getting backfill data.
These sql files are not used by the codebase, but are used manually 
in a SQL client like pg_admin4.