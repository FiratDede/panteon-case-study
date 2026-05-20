import cron from "node-cron";
import { logger } from "../config/logger";
import { finalizePreviousWeek } from "../jobs/finalize-week.job";

const WEEKLY_REWARD_CRON = "0 0 * * 1";
const CRON_TIMEZONE = "UTC";

export function scheduleWeeklyRewardPayout() {
  const task = cron.schedule(WEEKLY_REWARD_CRON, finalizePreviousWeek, {
    timezone: CRON_TIMEZONE
  });

  logger.info({ schedule: WEEKLY_REWARD_CRON, timezone: CRON_TIMEZONE }, "Weekly reward payout scheduled");

  return task;
}
