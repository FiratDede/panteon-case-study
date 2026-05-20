import { getCurrentWeekId, MILLISECONDS_PER_DAY } from "@panteon/shared";
import { logger } from "../config/logger";
import { finalizeWeek } from "../services/rewards.service";

function getPreviousWeekId(date = new Date()) {
  return getCurrentWeekId(new Date(date.getTime() - MILLISECONDS_PER_DAY));
}

export async function finalizePreviousWeek() {
  const weekId = getPreviousWeekId();

  try {
    logger.info({ weekId }, "Starting weekly reward payout");
    const result = await finalizeWeek(weekId);
    logger.info({ weekId, result }, "Weekly reward payout completed");
  } catch (error) {
    logger.error({ weekId, error }, "Weekly reward payout failed");
  }
}
