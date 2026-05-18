import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttpModule from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { healthRouter } from "./routers/health.router";
import { leaderboardRouter } from "./routers/leaderboard.router";
import { errorMiddleware } from "./middleware/error.middleware";

export function createApp() {
  const app = express();
  const pinoHttp = pinoHttpModule;

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger }));

  const apiRouter = express.Router();

  apiRouter.use("/health", healthRouter);
  apiRouter.use("/leaderboard", leaderboardRouter);

  app.use("/api", apiRouter);

  app.use(errorMiddleware);

  return app;
}
