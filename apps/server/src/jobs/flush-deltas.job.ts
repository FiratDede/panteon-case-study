import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { LeaderboardRepository } from "../repositories/leaderboard.repository.js";

export async function flushActiveWeekDeltas() {
  const repository = new LeaderboardRepository();
  const count = await repository.flushDeltasToPostgres(env.ACTIVE_WEEK_ID);
  logger.info({ count, weekId: env.ACTIVE_WEEK_ID }, "Flushed Redis deltas to PostgreSQL");
  return count;
}
