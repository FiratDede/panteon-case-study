import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectMongo } from "./db/mongo";
import { connectRedis } from "./db/redis";
import { createApp } from "./app";

async function bootstrap() {
  await Promise.all([connectRedis(), connectMongo()]);

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server listening");
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});
