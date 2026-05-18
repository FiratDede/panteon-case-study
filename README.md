# Panteon Leaderboard Case Study

Production-oriented weekly leaderboard implementation for the Panteon full-stack case study.

## Stack

- Server: Express.js, TypeScript, Prisma, PostgreSQL, Redis, MongoDB
- Client: Vite, React, TypeScript, Chakra UI

## Project Layout

```text
apps/server   Express API and background workers
apps/client   React leaderboard client
docs          Architecture, API, deployment, and AI workflow notes
```

## Local Setup

```bash
npm install
docker compose up -d
cp apps/server/.env.example apps/server/.env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Server runs on `http://localhost:4000`.
Client runs on `http://localhost:5173`.

To serve the production client build locally:

```bash
npm run build
npm run preview:client
```

## Verification

```bash
npm run typecheck
npm run test
npm run build
```

## Notes

Redis is the hot path for leaderboard reads/writes. PostgreSQL stores durable player, payout, weekly snapshot, and weekly aggregate data. MongoDB stores append-only event/audit records for investigation and reconciliation.
