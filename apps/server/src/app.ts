import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttpModule from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { earningsRouter } from "./routers/earnings.router.js";
import { healthRouter } from "./routers/health.router.js";
import { leaderboardRouter } from "./routers/leaderboard.router.js";
import { rewardsRouter } from "./routers/rewards.router.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

export function createApp() {
  const app = express();
  const pinoHttp = pinoHttpModule as unknown as typeof pinoHttpModule.default;

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger }));

  const apiRouter = express.Router();

  apiRouter.use("/health", healthRouter);
  apiRouter.use("/leaderboard", leaderboardRouter);
  apiRouter.use("/events", earningsRouter);
  apiRouter.use("/admin", rewardsRouter);

  app.use("/api", apiRouter);

  app.use(errorMiddleware);

  return app;
}
