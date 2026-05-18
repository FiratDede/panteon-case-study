# Architecture

The leaderboard is optimized around Redis sorted sets for active weekly ranking. PostgreSQL is the durable relational store for players, current money totals, weekly aggregates, finalized leaderboard snapshots, payouts, and idempotency. MongoDB stores append-only earning and audit events.

Redis is configured for AOF/RDB persistence locally and should use managed replica/failover in production. Redis is still not treated as the only durable copy of active weekly scores. Dirty Redis deltas are batch-flushed to PostgreSQL `player_weekly_scores`, which is the normal rebuild source if Redis data is lost.
