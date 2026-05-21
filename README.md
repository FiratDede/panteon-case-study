# Panteon Leaderboard Case Study

This README was written to provide information about the case study requested by Panteon.

Weekly leaderboard implementation for the Panteon full-stack case study. The project contains a TypeScript Express API, a separate cron worker, a React TypeScript client, and shared pure leaderboard utilities.

## Live Deployment

The deployed project is available at `http://3.122.158.66/`. This deployment contains 2,000,000 players and leaderboard scores, including winners for the previous week. You can download these players' week 21 scores (player_id : score) from this link https://panteon-case-study.s3.eu-central-1.amazonaws.com/leaderboard-2026-W21.csv.gz 

## AI-Assisted Development

This project was developed with Codex using the GPT-5.5 model. I first created `AGENTS.md` and `ROADMAP.md`, reviewed them carefully to define the architecture, constraints, and implementation order, and then started the implementation based on that plan. During implementation, I reviewed the generated code, checked the architectural decisions against the roadmap, and guided fixes or refinements where the output needed adjustment.

For more detailed notes about the AI-assisted development process, see [docs/ai-workflow.md](docs/ai-workflow.md).

## Applications

- `apps/server`: Express.js API application. It serves health checks, leaderboard reads, reward history, and backend leaderboard operations.
- `apps/client`: Vite React TypeScript frontend. It provides the leaderboard UI, player rank visibility, prize pool display, and current/previous week views.
- `apps/cron`: Cron worker application. Every Monday at 00:00, it rewards the top 100 winners from the previous week and updates their balances.
- `packages/shared`: Shared TypeScript utilities. It contains week calculation, Redis key helpers, reward math, and common leaderboard types used by the apps.

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

Open a terminal in the repository root first:

```bash
cd panteon-case-study
```

All workspace-level commands in this README should be run from this root directory unless a different path is explicitly mentioned.

### Option 1: Run Everything With Docker Compose

Use this option when you want PostgreSQL, Redis, MongoDB, the API server, the React client, and the cron worker to start together:

```bash
docker compose up -d --build
```

This also runs Prisma migrations and the large seed script before the API starts.

Each application has its own Dockerfile so the services can be built and monitored separately through Docker Compose:

- `apps/server/Dockerfile`
- `apps/client/Dockerfile`
- `apps/cron/Dockerfile`

The compose services expose these local ports:

- PostgreSQL from the `postgres` compose service on `localhost:5432`
- Redis from the `redis` compose service on `localhost:6379`
- MongoDB from the `mongo` compose service on `localhost:27017`
- API from the `server` compose service on `http://localhost:4000`
- Client from the `client` compose service on `http://localhost:5173`
- Cron worker from the `cron` compose service

The `-d` flag runs the containers in the background. To monitor services after startup, use:

```bash
docker compose ps
docker compose logs -f migrate-and-seed
docker compose logs -f server
docker compose logs -f client
docker compose logs -f cron
```

### Option 2: Run Only Databases With Docker Compose

Use this option when you want Docker Compose to run only PostgreSQL, Redis, and MongoDB, while running the Node applications manually on your machine:

```bash
docker compose up -d postgres redis mongo
```

Install dependencies:

```bash
npm install
```

Then create the server and cron environment files from the repository root:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/cron/.env.example apps/cron/.env
```

The default direct-run local values are:

```text
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://panteon:panteon@localhost:5432/panteon_leaderboard?schema=public
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=panteon_leaderboard
```

Prepare the database and seed the large local dataset from the repository root:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

`npm run seed` creates 2,000,000 players, 2,000,000 current week scores, and 2,000,000 previous week scores. If you only need the smaller Prisma sample seed, run:

Important: because this command inserts 2,000,000 players and millions of score entries, the related Docker Compose process can take a long time to finish starting.

```bash
npm --workspace apps/server run seed:demo
```

Start the API and client together from the repository root:

```bash
npm run dev
```

This direct command starts:

- API from `apps/server` on `http://localhost:4000`
- Client from `apps/client` on `http://localhost:5173`

Run the cron worker in a separate terminal when testing weekly finalization behavior. The command should also be run from the repository root:

```bash
npm run dev:cron
```

If you want to run each application directly from its own folder, use these paths:

```bash
cd apps/server
npm run dev
```

```bash
cd apps/client
npm run dev
```

```bash
cd apps/cron
npm run dev
```

When switching back to workspace-level commands such as `npm run build`, `npm run test`, or `npm run typecheck`, return to the repository root first:

```bash
cd ../..
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
- `seedLargeDataset.ts` runs the large dataset flow used by `npm run seed`: 2,000,000 players, current week scores, and previous week scores.
- `resetDb.bat` is a Windows convenience script that resets Prisma migrations, flushes local Docker Redis, and seeds players/scores.
- `resetAndCreateSamples.sh` is a shell script for Unix-like environments. It resets the PostgreSQL database through Prisma, flushes Redis, reruns migrations, and then creates player and leaderboard score samples. It  reads `REDIS_HOST`/`REDIS_PORT` from the environment when needed.

For the manual scripts to produce a clean and predictable dataset, PostgreSQL and Redis should be empty before running them. The easiest full reset for local Docker data is:

```bash
docker compose down -v --remove-orphans
docker compose up -d postgres redis mongo
npm run prisma:migrate
```

If the containers are already running and you only want to clear Redis before reseeding scores, run:

```bash
docker compose exec redis redis-cli FLUSHALL
```

The reset scripts accept an optional player/score count. If no value is passed, they use `2000000`:

```bash
apps/server/src/testScripts/resetDb.bat 2000000
```

```bash
REDIS_HOST=localhost REDIS_PORT=6379 sh apps/server/src/testScripts/resetAndCreateSamples.sh 2000000
```

Example usage from `apps/server`:

```bash
npx tsx src/testScripts/seedPlayers.ts 2000000
```

This creates 2,000,000 player records in PostgreSQL. Player names are deterministic and use the `player-{number}` format, for example `player-1`, `player-2`, and `player-2000000`.

```bash
npx tsx src/testScripts/seedScores.ts 2000000
```

This creates 2,000,000 randomized leaderboard score entries for the current week in Redis. The Redis sorted set key uses the shared leaderboard key format, for example `leaderboard:week:{weekId}`. Member values are player ids as strings, such as `"1"`, `"2"`, and `"2000000"`, and scores are random integer values. The script also calculates a 2% prize pool contribution from the generated total score and increments `leaderboard:week:{weekId}:pool`.

To seed and finalize a past week, pass a date in `yyyy/mm/dd` format:

```bash
npx tsx src/testScripts/seedScores.ts 2000000 2026/05/12
```

This creates 2,000,000 randomized score entries for the week that contains `2026/05/12`. If that week is before the current week, the script also runs the weekly finalization flow after seeding. That allows testing historical leaderboard winners and reward history without waiting for the real weekly cron schedule.

The numeric argument controls how many players or score entries are generated. Very large values such as `2000000` are useful for stress testing, but they can take time and should be used only when PostgreSQL and Redis are running locally or in the intended test environment.

To serve the production client build locally:

```bash
npm run build
npm run preview:client
```

## Deployment

The project is deployed on AWS using Free Tier resources. Because this setup does not include a purchased domain, the application is exposed directly through the public IP address shown in the Live Deployment section.

The cron application runs the weekly reward finalization job every Monday at `00:00`. At that time it finalizes the previous week's leaderboard, calculates rewards, persists payout records, and updates player balances.

The intended production shape is a containerized API service, a separate cron worker process, static hosting for the Vite client build, managed PostgreSQL, managed Redis with persistence/failover, and managed MongoDB. Environment variables must be configured in the deployment platform and secrets must not be committed.

## Documentation

- [docs/architecture.md](docs/architecture.md)
- [docs/api.md](docs/api.md)
- [docs/deployment.md](docs/deployment.md)
- [docs/ai-workflow.md](docs/ai-workflow.md)
