import cron from "node-cron";
import { logger } from "../config/logger";
import { MILLISECONDS_PER_DAY } from "../common/constants/time";
import { getCurrentWeekId } from "../common/utils/week";
import { finalizeWeek } from "./rewards.service";

const WEEKLY_REWARD_CRON = "0 0 * * 1";
const CRON_TIMEZONE = "UTC";

function getPreviousWeekId(date = new Date()) {
  return getCurrentWeekId(new Date(date.getTime() - MILLISECONDS_PER_DAY));
}

export function startRewardCron() {
  const task = cron.schedule(
    WEEKLY_REWARD_CRON,
    async () => {
      const weekId = getPreviousWeekId();

      try {
        logger.info({ weekId }, "Starting weekly reward payout cron");
        const result = await finalizeWeek(weekId);
        logger.info({ weekId, result }, "Weekly reward payout cron completed");
      } catch (error) {
        logger.error({ weekId, error }, "Weekly reward payout cron failed");
      }
    },
    {
      timezone: CRON_TIMEZONE
    }
  );

  logger.info({ schedule: WEEKLY_REWARD_CRON, timezone: CRON_TIMEZONE }, "Weekly reward payout cron scheduled");

  return task;
}
