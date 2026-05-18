# AGENTS.md

Guidance for AI-assisted development agents working on this repository.

## Project Goal

Build a production-ready weekly leaderboard system for a high-traffic idle/clicker game.

The final repository must contain separate TypeScript client and server projects, stay within the required stack, and be deployable to an accessible production domain.

Required stack:

- Node.js
- TypeScript
- PostgreSQL
- MongoDB
- Redis
- React TypeScript frontend

## Case Study Priorities

Optimize decisions around these review criteria:

- Stateless backend architecture
- Fast leaderboard reads at large scale
- Correct weekly prize pool accounting and payout
- Clear player rank visibility, including top 100 and local rank context
- Mobile and desktop usability
- Production-quality build, deployment, documentation, and code organization
- Evidence of thoughtful AI-assisted development

## Proposed Repository Structure

Use separate client and server projects:

```text
.
|-- apps/
|   |-- server/              # Express.js Node.js TypeScript backend
|   `-- client/              # React TypeScript frontend
|-- infra/
|   |-- docker/              # Local service config
|   `-- migrations/          # Database migration notes/scripts if not app-local
|-- docs/
|   |-- architecture.md
|   |-- api.md
|   |-- deployment.md
|   `-- ai-workflow.md
|-- docker-compose.yml
|-- ROADMAP.md
`-- AGENTS.md
```

Prefer a simple workspace-based setup with `apps/server` and `apps/client`. Do not add a shared package unless the project later grows enough to justify it.

Expected server module structure:

```text
apps/server/
|-- prisma/                  # Prisma schema, migrations, seed data for PostgreSQL
|-- src/
|   |-- app.ts               # Express app wiring
|   |-- server.ts            # HTTP bootstrap
|   |-- config/              # Environment and runtime config
|   |-- db/                  # Prisma, Redis, MongoDB clients
|   |-- routers/             # Express routers grouped by API area
|   |-- controllers/         # Request/response handlers
|   |-- services/            # Business logic and orchestration
|   |-- repositories/        # PostgreSQL/Prisma, Redis, MongoDB data access
|   |-- validators/          # Request validation schemas
|   |-- middleware/          # Express middleware
|   |-- jobs/                # Scheduled/finalization workers
|   |-- types/               # App-local TypeScript types
|   |-- utils/
|   `-- tests/
`-- package.json
```

Backend files should be named by domain inside each layer, for example `leaderboard.router.ts`, `leaderboard.controller.ts`, `leaderboard.service.ts`, and `leaderboard.repository.ts`.

Expected client module structure:

```text
apps/client/
|-- src/
|   |-- app/                 # App shell, providers, routing
|   |-- features/
|   |   `-- leaderboard/     # Screen, hooks, components, API client
|   |-- components/          # Reusable app-level UI components
|   |-- theme/               # Chakra UI theme extensions
|   |-- lib/                 # HTTP client and utilities
|   |-- mocks/               # Sample data for local/demo testing
|   `-- main.tsx
`-- package.json
```

## Architecture Decisions

Default choices unless later implementation work proves a better local fit:

- Backend framework: Express.js with TypeScript.
- Backend database library: Prisma for PostgreSQL schema, migrations, queries, and transactions.
- Frontend: Vite, React, TypeScript, Chakra UI.
- PostgreSQL: source of truth for users, player total money, reward payouts, weekly leaderboard snapshots, and idempotency records.
- Redis: hot weekly leaderboard using sorted sets. Redis is not the only durability layer.
- MongoDB: append-only gameplay earning events, payout audit logs, and operational event history. It is not the ranking source of truth and should not be used for money-moving transactions.
- Redis sorted set key format: `leaderboard:week:{weekId}`.
- Prize pool key format: `leaderboard:week:{weekId}:pool`.
- Production Redis should enable AOF, use RDB snapshots where supported, and run with replica/failover through a managed Redis provider when possible.
- All write APIs must be idempotent where duplicate client/server retries are possible.
- Backend instances must be stateless. State belongs in PostgreSQL, MongoDB, Redis, or the job scheduler/queue infrastructure.

## Core Backend Behavior

Implement these flows:

1. Currency earning ingestion
   - Accept player earning events with an idempotency key.
   - Validate player and amount.
   - Add gross earned amount to Redis weekly score.
   - Add 2% of gross earned amount to the weekly prize pool.
   - Track dirty score deltas so PostgreSQL weekly aggregates can be updated asynchronously in batches.
   - Persist durable records for replay, auditing, and payout reconciliation.

2. Leaderboard reads
   - Return top 100 players for the active week.
   - Return the requesting player's rank.
   - If the player is outside top 100, include 3 players above and 2 players below.
   - Do not perform deep PostgreSQL scans for rank lookup. Redis sorted set rank operations should serve hot reads.

3. Weekly finalization
   - Lock finalization so only one worker finalizes a week.
   - Snapshot top 100 from Redis.
   - Calculate prize allocation:
     - Rank 1: 20%
     - Rank 2: 15%
     - Rank 3: 10%
     - Ranks 4-100: remaining 55%, weighted by rank.
   - Persist payout records before increasing the player's `total_money`.
   - Mark the week finalized.
   - Reset active leaderboard and pool for the next week.

4. Recovery
   - A failed finalization must be retryable.
   - Redis AOF/RDB and replica/failover should provide first-line recovery.
   - PostgreSQL weekly score aggregates must allow the active leaderboard to be rebuilt if Redis data is lost.
   - MongoDB earning events remain the audit/reconciliation source, not the primary rebuild path for high-volume traffic.

## Frontend Behavior

Build the actual leaderboard experience, not a marketing page.

Required screen behavior:

- Top 100 list is visible and performant.
- The current player has a persistent, easy-to-find rank summary.
- If the player is outside the top 100, show a separate "around me" context section with 3 above and 2 below.
- Show weekly prize pool, time remaining, and projected/current reward status.
- Include loading, empty, error, and retry states.
- Support mobile and desktop layouts.
- Use reusable React components for leaderboard rows, rank badges, reward indicators, tabs/filters, and status panels.
- Include sample data and a way to test the UI without production data.

## Quality Bar

Backend:

- Strict TypeScript.
- Express backend should use a layered folder structure: `routers`, `controllers`, `services`, `repositories`, `validators`, `middleware`, and `jobs`.
- Keep domain names consistent across layers, for example `earnings.router.ts`, `earnings.controller.ts`, `earnings.service.ts`, and `earnings.repository.ts`.
- Use Prisma for PostgreSQL access and transactions.
- Use the MongoDB driver for append-only event/audit collections.
- Runtime request validation.
- Structured errors.
- Health checks.
- Configuration through environment variables.
- Unit tests for payout math and rank window logic.
- Integration tests for key API flows where practical.
- No in-memory process state for leaderboard correctness.

Frontend:

- Strict TypeScript.
- Chakra UI for layout primitives, theme tokens, responsive behavior, and accessible controls.
- Feature-based module structure under `src/features`.
- Responsive layout verified on desktop and mobile.
- Reusable components.
- Accessible buttons, states, and semantic structure.
- Avoid layout shift in leaderboard rows.
- Production build must pass.

Data:

- Use integer minor units for currency math. Do not use floating point for prize allocation.
- Record rounding strategy explicitly.
- Store week identifiers consistently, preferably ISO week based or a documented UTC week window.
- Use database constraints for uniqueness and idempotency where possible.
- Do not rely on Redis as the only copy of active weekly scores. Keep a PostgreSQL `player_weekly_scores` aggregate updated by batch flushing Redis deltas.

## Documentation Requirements

Before final submission, include:

- `README.md`: setup, local run, test, build, deployment links.
- `docs/architecture.md`: system design and tradeoffs.
- `docs/api.md`: endpoint contracts.
- `docs/deployment.md`: deployed services, environment variables, and operational notes.
- `docs/ai-workflow.md`: tools used, where AI helped, and human decisions made.

## Working Rules For Agents

- Read existing code before editing.
- Keep client and server code separated.
- Prefer small, focused commits or change sets.
- Do not introduce services outside the required stack unless the user explicitly approves.
- Do not store secrets in the repository.
- Do not revert user changes.
- Keep generated sample data deterministic where possible.
- When changing payout, ranking, or accounting logic, add or update tests.
- When changing UI behavior, verify both desktop and mobile responsive states.

## Deployment Target

The implementation should support containerized deployment. Prefer a simple production path:

- API service container
- Web static build hosting or web container
- Managed PostgreSQL
- Managed MongoDB
- Managed Redis

Document the chosen provider and deployed URLs in `README.md` and `docs/deployment.md` once deployment is complete.
