# AI Workflow

AI assistance was used to shape the architecture, roadmap, and implementation plan. Human decisions made during planning:

- Use Express.js instead of Fastify/NestJS for the backend.
- Use Prisma for PostgreSQL access and migrations.
- Use Chakra UI for the frontend.
- Keep backend folders layered as routers, controllers, services, repositories, validators, middleware, and jobs.
- Keep MongoDB as append-only event/audit storage instead of using it for ranking or money-moving transactions.
- Remove a separate wallets table and store current player money as `players.total_money`.
- Use Redis as the hot leaderboard path while keeping PostgreSQL weekly aggregates for rebuilds.
