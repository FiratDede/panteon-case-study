import { logger } from "../config/logger.js";
import { flushDeltasToPostgres } from "../repositories/leaderboard.repository.js";
import { getCurrentWeekId } from "../utils/week.js";

export async function flushActiveWeekDeltas() {
  const weekId = getCurrentWeekId();
  const count = await flushDeltasToPostgres(weekId);
  logger.info({ count, weekId }, "Flushed Redis deltas to PostgreSQL");
  return count;
}
