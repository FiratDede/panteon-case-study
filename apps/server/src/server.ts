import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectMongo } from "./db/mongo.js";
import { connectRedis } from "./db/redis.js";
import { createApp } from "./app.js";

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
