import { randomInt } from "crypto";
import { getLeaderboardKey, getPrizePoolKey } from "../common/utils/redis-keys";
import { getCurrentWeekId } from "../common/utils/week";
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

async function run() {
  if (process.argv.length < 3) {
    throw new Error("You must specify how many scores of players you want to create");
  }

  const totalCountOfPlayers = Number(process.argv[2]);
  let totalScore = 0n;
  const data = Array.from({ length: totalCountOfPlayers }, (_, index) => ({
    value: (index + 1).toString(),
    score: randomInt(5000000)
  })).map((entry) => {
    totalScore += BigInt(entry.score);
    return entry;
  });

  const weekId = getCurrentWeekId();
  const leaderboardKey = getLeaderboardKey(weekId);
  const prizePoolKey = getPrizePoolKey(weekId);
  const chunks = chunkArray(data, 1000);
  const prizePoolContribution = (totalScore * 2n) / 100n;

  await connectRedis();

  await runWithConcurrency(chunks, 5, (chunk) => redis.zAdd(leaderboardKey, chunk));
  await redis.incrBy(prizePoolKey, Number(prizePoolContribution));

  console.log(`${totalCountOfPlayers} player scores added to ${leaderboardKey}.`);
  console.log(`${prizePoolContribution.toString()} added to ${prizePoolKey}.`);
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
