import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectMongo } from "./db/mongo";
import { connectRedis } from "./db/redis";
import { createApp } from "./app";
import { startRewardCron } from "./services/cron.service";
import { finalizeWeek } from "./services/rewards.service";
import { getCurrentWeekId } from "./common/utils/week";

async function bootstrap() {
  await Promise.all([connectRedis(), connectMongo()]);

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server listening");
  });

  startRewardCron();

  // console.log(await finalizeWeek(getCurrentWeekId()))

  //  const oneWeekAgo = new Date();
  // oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  // const weekId = getCurrentWeekId(oneWeekAgo)

  // console.log(await finalizeWeek(getCurrentWeekId(oneWeekAgo)))
}

bootstrap().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});
