import { logger } from "../config/logger";
import { flushDeltasToPostgres } from "../repositories/leaderboard.repository";
import { getCurrentWeekId } from "../common/utils/week";

export async function flushActiveWeekDeltas() {
  const weekId = getCurrentWeekId();
  const count = await flushDeltasToPostgres(weekId);
  logger.info({ count, weekId }, "Flushed Redis deltas to PostgreSQL");
  return count;
}
