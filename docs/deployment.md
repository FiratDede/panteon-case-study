# Deployment

Recommended production deployment:

- API container running the Express server and background worker process.
- Static client hosting for the Vite build.
- Managed PostgreSQL.
- Managed Redis with persistence and failover.
- Managed MongoDB.

Environment variables must be configured per deployed service. Do not commit secrets.
