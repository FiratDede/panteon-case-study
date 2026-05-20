import { randomInt } from "crypto";
import { getCurrentWeekId, getDefaultWeekWindow, getLeaderboardKey, getPrizePoolKey } from "@panteon/shared";
import { chunkArray } from "../common/utils/chunk";
import { connectRedis, redis } from "../db/redis";

async function runWithConcurrency<T>(items: T[], concurrency: number, worker: (item: T) => Promise<unknown>) {
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const item = items[nextIndex];
      nextIndex += 1;
      await worker(item);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, runWorker));
}

function parseSeedDate(input?: string) {
  if (!input) {
    return new Date();
  }

  const match = /^(?<year>\d{4})\/(?<month>\d{2})\/(?<day>\d{2})$/.exec(input);
  if (!match?.groups) {
    throw new Error("Date must be in yyyy/mm/dd format");
  }

  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error("Date must be a valid calendar date");
  }

  return date;
}

function isPastWeek(weekId: string, currentWeekId: string) {
  return getDefaultWeekWindow(weekId).startsAt.getTime() < getDefaultWeekWindow(currentWeekId).startsAt.getTime();
}

async function run() {
  if (process.argv.length < 3) {
    throw new Error("Usage: ts-node seedScores.ts <scoreCount> [yyyy/mm/dd]");
  }

  const totalCountOfPlayers = Number(process.argv[2]);
  if (!Number.isInteger(totalCountOfPlayers) || totalCountOfPlayers <= 0) {
    throw new Error("Score count must be a positive integer");
  }

  const seedDate = parseSeedDate(process.argv[3]);
  let totalScore = 0n;
  const data = Array.from({ length: totalCountOfPlayers }, (_, index) => ({
    value: (index + 1).toString(),
    score: randomInt(5000000)
  })).map((entry) => {
    totalScore += BigInt(entry.score);
    return entry;
  });

  const weekId = getCurrentWeekId(seedDate);
  const currentWeekId = getCurrentWeekId();
  const leaderboardKey = getLeaderboardKey(weekId);
  const prizePoolKey = getPrizePoolKey(weekId);
  const chunks = chunkArray(data, 1000);
  const prizePoolContribution = (totalScore * 2n) / 100n;

  await connectRedis();

  await runWithConcurrency(chunks, 5, (chunk) => redis.zAdd(leaderboardKey, chunk));
  await redis.incrBy(prizePoolKey, Number(prizePoolContribution));

  console.log(`${totalCountOfPlayers} player scores added to ${leaderboardKey}.`);
  console.log(`${prizePoolContribution.toString()} added to ${prizePoolKey}.`);

  if (isPastWeek(weekId, currentWeekId)) {
    const [{ finalizeWeek }, cronRedis, cronMongo, cronPrisma] = await Promise.all([
      import("../../../cron/src/services/rewards.service"),
      import("../../../cron/src/db/redis"),
      import("../../../cron/src/db/mongo"),
      import("../../../cron/src/db/prisma")
    ]);

    await Promise.all([cronRedis.connectRedis(), cronMongo.connectMongo()]);

    try {
      const result = await finalizeWeek(weekId);
      console.log(`Finalized ${weekId}: ${JSON.stringify(result)}`);
    } finally {
      if (cronRedis.redis.isOpen) {
        await cronRedis.redis.quit();
      }

      await cronMongo.mongoClient.close();
      await cronPrisma.prisma.$disconnect();
    }
  }
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (redis.isOpen) {
      await redis.quit();
    }
  });
