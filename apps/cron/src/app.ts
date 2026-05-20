import type { ScheduledTask } from "node-cron";
import { logger } from "./config/logger";
import { connectMongo, mongoClient } from "./db/mongo";
import { prisma } from "./db/prisma";
import { connectRedis, redis } from "./db/redis";
import { scheduleWeeklyRewardPayout } from "./schedulers/weekly-reward.scheduler";

export async function startCronApp() {
  await Promise.all([connectRedis(), connectMongo()]);

  const tasks = [scheduleWeeklyRewardPayout()];
  logger.info("Cron worker started");

  registerShutdown(tasks);
}

function registerShutdown(tasks: ScheduledTask[]) {
  async function shutdown(signal: string) {
    logger.info({ signal }, "Stopping cron worker");

    for (const task of tasks) {
      task.stop();
    }

    if (redis.isOpen) {
      await redis.quit();
    }

    await mongoClient.close();
    await prisma.$disconnect();
    process.exit(0);
  }

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}
