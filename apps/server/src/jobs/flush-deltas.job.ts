import { getCurrentWeekId } from "@panteon/shared";
import { logger } from "../config/logger";
import { flushDeltasToPostgres } from "../repositories/leaderboard.repository";

export async function flushActiveWeekDeltas() {
  const weekId = getCurrentWeekId();
  const count = await flushDeltasToPostgres(weekId);
  logger.info({ count, weekId }, "Flushed Redis deltas to PostgreSQL");
  return count;
}
