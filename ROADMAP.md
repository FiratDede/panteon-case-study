# ROADMAP.md

Production roadmap for the Panteon weekly leaderboard case study.

## Assumptions

- Weekly ranking is based on gross in-game currency earned during the active week.
- The prize pool receives 2% of gross weekly earnings.
- Currency and rewards are represented as integer minor units to avoid floating point errors.
- Ranking weeks use a documented UTC boundary.
- Redis is the hot path for leaderboard reads and writes; PostgreSQL and MongoDB provide durability, reconciliation, and auditability.
- The backend remains stateless. Any number of API instances should be able to serve requests.
- Prisma is used for PostgreSQL schema management, migrations, queries, and transactions.
- MongoDB is used for append-only event and audit records, not for player money or payout transactions.
- Chakra UI is used for the frontend component system, responsive layout primitives, and theme tokens.
- Redis persistence should be enabled with AOF and RDB snapshots where supported, but Redis must not be the only durable copy of active weekly scores.
- PostgreSQL `player_weekly_scores` stores batch-flushed weekly score aggregates for Redis rebuilds.

## Target Architecture

```text
React Web App
    |
    | HTTPS JSON API
    v
Express.js Node.js TypeScript API
    |
    |-- PostgreSQL via Prisma: players, total money, weekly snapshots, payouts, idempotency
    |-- Redis: active weekly sorted set, prize pool counter, short-lived locks/cache
    |-- MongoDB: earning events, payout audit events, operational logs
    |
    v
Weekly Finalization Worker
```

### Redis Model

- `leaderboard:week:{weekId}`: sorted set of `playerId -> weekly earned amount`.
- `leaderboard:week:{weekId}:pool`: integer pool amount.
- `leaderboard:week:{weekId}:deltas`: dirty score deltas waiting to be flushed to PostgreSQL aggregates.
- `leaderboard:week:{weekId}:finalize-lock`: short-lived lock for finalization.

Production Redis should use:

- AOF with `appendfsync everysec` or the managed-provider equivalent.
- RDB snapshots as an additional recovery layer where available.
- Replica/failover through a managed Redis provider when possible.

Redis remains the hot path, not the only source of durability.

### PostgreSQL Model

Managed through Prisma migrations.

Initial tables:

- `players`
- `player_weekly_scores`
- `weekly_leaderboards`
- `weekly_leaderboard_entries`
- `reward_payouts`
- `idempotency_keys`

The `players` table should include a `total_money` integer column for the player's current money balance.

The `player_weekly_scores` table stores one aggregate score per player per week. It is updated asynchronously from Redis dirty deltas and is the primary rebuild source if the active Redis leaderboard is lost.

### MongoDB Model

Managed as append-only collections through the MongoDB driver.

Initial collections:

- `earning_events`
- `payout_audit_events`
- `system_events`

MongoDB stores raw earning and audit events for investigation and reconciliation. It should not be the normal high-speed rebuild path because replaying every raw event for a busy week can be much slower than restoring from PostgreSQL weekly aggregates.

## API Scope

Minimum production API:

- `GET /api/health`
- `GET /api/leaderboard/weeks/current?playerName={name}`
- `GET /api/leaderboard/weeks/{weekId}?playerName={name}`
- `POST /api/leaderboard/earnings`
- `POST /api/leaderboard/weeks/reset` for protected/manual testing

Public leaderboard GET routes should accept `playerName`. Internally, the server resolves that name to the stable `playerId` used by PostgreSQL relations and Redis sorted sets.

Expected leaderboard response:

- `week`
- `prizePool`
- `timeRemaining`
- `top100`
- `currentPlayer`
- `aroundPlayer` when the player is outside top 100
- `rewardRules`

## Modular Code Structure

Server code should use a layered Express structure:

- `routers`: Express route registration grouped by API area.
- `controllers`: request parsing and response shaping.
- `services`: business logic and orchestration.
- `repositories`: Prisma, Redis, and MongoDB data access.
- `validators`: runtime request validation schemas.
- `middleware`: cross-cutting Express middleware.
- `common`: shared errors, constants, and utility functions.
- `jobs`: scheduled and manual weekly finalization workers.

Use consistent domain names across layers:

- `leaderboard.router.ts`, `leaderboard.controller.ts`, `leaderboard.service.ts`, `leaderboard.repository.ts`
- `earnings.controller.ts`, `earnings.service.ts`
- `rewards.controller.ts`, `rewards.service.ts`
- `players.router.ts`, `players.controller.ts`, `players.service.ts`, `players.repository.ts`
- `health.router.ts`, `health.controller.ts`, `health.service.ts`

Client modules should be organized by feature:

- `features/leaderboard`: screen, API calls, hooks, and leaderboard-specific components.
- `components`: reusable app-level UI pieces.
- `theme`: Chakra UI theme customization.
- `lib`: HTTP client, formatting, and utility functions.
- `mocks`: sample data for demo and UI development.

## Prize Distribution

Payout rules:

- Rank 1: 20% of pool
- Rank 2: 15% of pool
- Rank 3: 10% of pool
- Ranks 4-100: remaining 55%

Implementation detail for ranks 4-100:

- Use a descending rank weight so rank 4 receives more than rank 100.
- Suggested formula: `weight = 101 - rank`.
- Sum weights for ranks 4 through 100.
- Allocate integer rewards by floor division.
- Assign any rounding remainder deterministically from highest rank downward.

This keeps the rule "based on rank" explicit, deterministic, and testable.

## Redis Durability And Rebuild

Redis data is memory-first, so the system must handle Redis loss explicitly.

Normal earning write path:

```text
Earning event
  -> Redis ZINCRBY leaderboard score
  -> Redis INCRBY prize pool
  -> Redis delta buffer update
  -> MongoDB append-only earning event
  -> Background worker batch flushes Redis deltas to PostgreSQL player_weekly_scores
```

Rebuild path if Redis data is lost:

```text
1. Read player_weekly_scores for the active week from PostgreSQL.
2. Bulk restore Redis sorted set leaderboard:week:{weekId}.
3. Restore prize pool from weekly_leaderboards or the aggregate earning contribution.
4. Use MongoDB earning_events only for audit, reconciliation, or exceptional replay.
```

This avoids rebuilding from potentially hundreds of millions or billions of raw earning events.

## Milestone 1: Foundation

Deliverables:

- Monorepo/workspace setup.
- `apps/server` Express.js TypeScript Node.js project.
- `apps/client` React TypeScript project.
- Prisma setup in `apps/server/prisma`.
- Chakra UI setup in `apps/client`.
- Layered backend folders: `routers`, `controllers`, `services`, `repositories`, `validators`, `middleware`, and `jobs`.
- Feature-based frontend folders under `apps/client/src/features`.
- Linting, formatting, strict TypeScript configuration.
- Local Docker Compose for PostgreSQL, MongoDB, and Redis.
- Base `README.md`.

Acceptance checks:

- `server` starts locally.
- `client` starts locally.
- Prisma client generates successfully.
- Type checking passes.
- Local databases start with one command.

## Milestone 2: Backend Data And Ranking Core

Deliverables:

- PostgreSQL migrations/schema through Prisma.
- `player_weekly_scores` aggregate table for Redis rebuilds.
- MongoDB connection and event persistence.
- Redis leaderboard service.
- Redis dirty delta tracking.
- Background batch flusher from Redis deltas to PostgreSQL aggregates.
- Week service with active week calculation.
- Earning event ingestion with idempotency.
- Prize pool accumulation.
- Seed script for sample players and leaderboard data.
- Layered backend implementations for leaderboard, earnings, rewards, players, and health.

Acceptance checks:

- Duplicate earning event idempotency key is ignored safely.
- Redis rank and score update correctly after earning.
- PostgreSQL weekly aggregate is updated by the batch flusher.
- Prize pool increases by exactly 2% of gross earnings.
- Active leaderboard can be rebuilt from `player_weekly_scores`.
- Seed script creates enough data to test top 100 and outside-top-100 behavior.

## Milestone 3: Leaderboard API

Deliverables:

- Current leaderboard endpoint.
- Historical week endpoint if snapshots exist.
- Rank window logic for 3 above and 2 below.
- Response shaping with player display names, rank, score, and reward estimate.
- Unit tests for rank windows and response edge cases.

Acceptance checks:

- Top 100 returns quickly from Redis.
- Player inside top 100 is highlighted without duplicate context rows.
- Player outside top 100 receives 3 above and 2 below when available.
- Edge cases work near rank 101, near last rank, and for unranked players.

## Milestone 4: Weekly Finalization And Rewards

Deliverables:

- Finalization service.
- Distributed lock around finalization.
- Top 100 snapshot persistence.
- Reward payout calculation and persistence.
- Player `total_money` update transaction.
- MongoDB audit event for every payout.
- Manual protected finalization endpoint for review/demo.
- Unit tests for payout math and rounding.

Acceptance checks:

- Finalization is retryable.
- Running finalization twice does not double-pay.
- Total paid amount equals the prize pool, subject to documented zero-player handling.
- Week is marked finalized and the next week starts cleanly.

## Milestone 5: Frontend Leaderboard Experience

Deliverables:

- Responsive leaderboard screen.
- Chakra UI theme, provider, and responsive layout primitives.
- Top 100 section.
- Current player summary.
- Around-me section for players outside top 100.
- Prize pool and weekly countdown/status panel.
- Reward tier/status communication.
- Loading, error, empty, and retry states.
- Mock/sample data mode or seeded backend integration.

Acceptance checks:

- Works on desktop and mobile.
- Current player position is immediately visible.
- Long lists remain smooth.
- Production build succeeds.
- UI uses reusable components rather than one large page component.

## Milestone 6: Production Hardening

Deliverables:

- Request validation and typed error responses.
- Structured logging.
- Health checks for API, PostgreSQL, MongoDB, and Redis.
- Environment variable validation.
- Rate limiting for public endpoints.
- Basic API security notes.
- Redis persistence/rebuild documentation.
- Integration tests for main API flows.
- Load-test notes or a lightweight script for leaderboard reads.

Acceptance checks:

- Service fails fast on invalid configuration.
- API can be horizontally scaled without correctness issues.
- Test suite passes.
- Important operational failure modes are documented.

## Milestone 7: Deployment

Deliverables:

- Production Dockerfile(s).
- Deployment configuration.
- Managed PostgreSQL, MongoDB, and Redis setup.
- Public API URL.
- Public web URL.
- Production environment documentation.

Acceptance checks:

- Deployed web app loads from an accessible domain.
- Deployed web app can call deployed API.
- Seed/sample data is available for reviewers.
- `README.md` contains live URL(s), setup commands, and test commands.

## Milestone 8: Submission Polish

Deliverables:

- `docs/architecture.md`
- `docs/api.md`
- `docs/deployment.md`
- `docs/ai-workflow.md`
- Screenshots or short demo notes if useful.
- Final cleanup of TODOs and unused code.

Acceptance checks:

- A reviewer can understand the architecture in a few minutes.
- A reviewer can run the project locally.
- AI workflow is clearly documented.
- Repository is ready to share through GitHub or Bitbucket.

## Risk Register

- Redis data loss: mitigate with AOF/RDB, managed replica/failover, PostgreSQL `player_weekly_scores` aggregates, and rebuild tooling.
- Duplicate payout: mitigate with database uniqueness, finalization lock, and idempotent payout records.
- Currency rounding errors: mitigate with integer arithmetic and deterministic remainder distribution.
- Deep rank lookups: mitigate with Redis sorted set rank operations.
- Hot leaderboard traffic: mitigate with efficient Redis reads, response shaping, and optional short TTL caching.
- Ambiguous reward distribution for ranks 4-100: mitigate by documenting and testing the rank-weighted formula.

## Suggested Build Order

1. Scaffold workspace and local infrastructure.
2. Implement backend ranking and seed data.
3. Implement leaderboard API.
4. Build frontend against mocked response shape.
5. Connect frontend to API.
6. Add weekly finalization and payout.
7. Harden, test, and document.
8. Deploy and update README with live links.
