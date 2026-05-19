import { randomInt } from "crypto";
import { getLeaderboardKey } from "../common/utils/redis-keys";
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
  const data = Array.from({ length: totalCountOfPlayers }, (_, index) => ({
    value: (index + 1).toString(),
    score: randomInt(5000000)
  }));

  const weekId = getCurrentWeekId();
  const leaderboardKey = getLeaderboardKey(weekId);
  const chunks = chunkArray(data, 1000);

  await connectRedis();

  await runWithConcurrency(chunks, 5, (chunk) => redis.zAdd(leaderboardKey, chunk));

  console.log(`${totalCountOfPlayers} player scores added to ${leaderboardKey}.`);
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
