# Panteon Leaderboard Case Study

Production-oriented weekly leaderboard implementation for the Panteon full-stack case study. The project contains a TypeScript Express API, a separate cron worker, a React TypeScript client, and shared pure leaderboard utilities.

## Stack

- Server: Node.js, Express.js, TypeScript, Prisma, PostgreSQL, Redis, MongoDB
- Cron worker: Node.js, TypeScript, node-cron, Prisma, Redis, MongoDB
- Client: Vite, React, TypeScript, Chakra UI
- Shared package: TypeScript utilities for week calculation, Redis keys, reward math, and leaderboard types

## Project Layout

```text
apps/server       Express API, Prisma schema, seed data, tests
apps/cron         Weekly reward finalization worker
apps/client       React leaderboard client
packages/shared  Shared pure utilities and types
docs              Architecture, API, deployment, and AI workflow notes
docker-compose.yml
ROADMAP.md
AGENTS.md
```

## Features

- Current and historical weekly leaderboard reads.
- Top players, current player rank, and local rank context around the selected player.
- Weekly prize pool visibility and reward history.
- Weekly finalization worker that calculates and persists winner payouts.
- PostgreSQL as durable source for players, weekly leaderboards, winners, and balances.
- Redis sorted sets for hot leaderboard reads.
- MongoDB for operational audit/event records.
- Deterministic seed data for local testing.

## Local Setup

Install dependencies and start local infrastructure:

```bash
npm install
docker compose up -d
```

Create the server environment file:

```bash
cp apps/server/.env.example apps/server/.env
```

The default local values are:

```text
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://panteon:panteon@localhost:5432/panteon_leaderboard?schema=public
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=panteon_leaderboard
```

Prepare the database and seed demo data:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

## Running Locally

Run the API and client together:

```bash
npm run dev
```

Run the cron worker separately when testing weekly finalization behavior:

```bash
npm run dev:cron
```

Local URLs:

- API: `http://localhost:4000`
- Client: `http://localhost:5173`
- Health check: `http://localhost:4000/api/health`

## API

Main endpoints:

- `GET /api/health`
- `GET /api/leaderboard/weeks/current?playerName={playerName}`
- `GET /api/leaderboard/weeks/{weekId}?playerName={playerName}`
- `GET /api/leaderboard/weeks/rewards/history`
- `GET /api/leaderboard/weeks/rewards/history?weekId={weekId}`

See [docs/api.md](docs/api.md) for endpoint notes.

## Verification

```bash
npm run typecheck
npm run test
npm run build
```

## Manual Test Data Scripts

Additional helper scripts live under `apps/server/src/testScripts`. These are not part of the automated unit test suite; they are manual scripts for resetting local/demo data and generating large leaderboard datasets.

- `seedPlayers.ts` creates deterministic players named `player-1`, `player-2`, and so on.
- `seedScores.ts` writes randomized scores into the Redis sorted set for a selected week and updates that week's prize pool key.
- `resetDb.bat` is a Windows convenience script that resets Prisma migrations and seeds sample players/scores.
- `resetAndCreateSamples.sh` is a shell script for a deployment-like environment. It resets the PostgreSQL database through Prisma, flushes Redis, reruns migrations, and then creates sample players and leaderboard scores. It should be adjusted before use because it contains environment-specific paths and Redis host settings.

Example usage from `apps/server`:

```bash
npx tsx src/testScripts/seedPlayers.ts 10000
```

This creates 10,000 player records in PostgreSQL. Player names are deterministic and use the `player-{number}` format, for example `player-1`, `player-2`, and `player-10000`.

```bash
npx tsx src/testScripts/seedScores.ts 10000
```

This creates 10,000 randomized leaderboard score entries for the current week in Redis. The Redis sorted set key uses the shared leaderboard key format, for example `leaderboard:week:{weekId}`. Member values are player ids as strings, such as `"1"`, `"2"`, and `"10000"`, and scores are random integer values. The script also calculates a 2% prize pool contribution from the generated total score and increments `leaderboard:week:{weekId}:pool`.

To seed and finalize a past week, pass a date in `yyyy/mm/dd` format:

```bash
npx tsx src/testScripts/seedScores.ts 10000 2026/05/12
```

This creates 10,000 randomized score entries for the week that contains `2026/05/12`. If that week is before the current week, the script also runs the weekly finalization flow after seeding. That allows testing historical leaderboard winners and reward history without waiting for the real weekly cron schedule.

The numeric argument controls how many players or score entries are generated. Very large values such as `2000000` are useful for stress testing, but they can take time and should be used only when PostgreSQL and Redis are running locally or in the intended test environment.

To serve the production client build locally:

```bash
npm run build
npm run preview:client
```

## Documentation

- [docs/architecture.md](docs/architecture.md)
- [docs/api.md](docs/api.md)
- [docs/deployment.md](docs/deployment.md)
- [docs/ai-workflow.md](docs/ai-workflow.md)

## AI-Assisted Development

This project was developed with Codex using the GPT-5.5 model. I first created `AGENTS.md` and `ROADMAP.md`, reviewed them carefully to define the architecture, constraints, and implementation order, and then started the implementation based on that plan. During implementation, I reviewed the generated code, checked the architectural decisions against the roadmap, and guided fixes or refinements where the output needed adjustment.

## Deployment

The intended production shape is a containerized API service, a separate cron worker process, static hosting for the Vite client build, managed PostgreSQL, managed Redis with persistence/failover, and managed MongoDB. Environment variables must be configured in the deployment platform and secrets must not be committed.
