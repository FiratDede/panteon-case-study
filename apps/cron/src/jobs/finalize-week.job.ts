import { randomUUID } from "node:crypto";
import { getCurrentWeekId, MILLISECONDS_PER_DAY } from "@panteon/shared";
import { logger } from "../config/logger";
import { insertCronJobEvent } from "../repositories/audit.repository";
import { finalizeWeek } from "../services/rewards.service";

const WEEKLY_REWARD_JOB_NAME = "weekly_reward_payout";

function getPreviousWeekId(date = new Date()) {
  return getCurrentWeekId(new Date(date.getTime() - MILLISECONDS_PER_DAY));
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    message: String(error)
  };
}

async function writeCronJobEvent(event: Parameters<typeof insertCronJobEvent>[0]) {
  try {
    await insertCronJobEvent(event);
  } catch (error) {
    logger.error({ error, event }, "Failed to write cron job event");
  }
}

export async function finalizePreviousWeek() {
  const runId = randomUUID();
  const weekId = getPreviousWeekId();

  await writeCronJobEvent({
    runId,
    jobName: WEEKLY_REWARD_JOB_NAME,
    weekId,
    status: "STARTED"
  });

  try {
    logger.info({ runId, weekId }, "Starting weekly reward payout");
    const result = await finalizeWeek(weekId);
    await writeCronJobEvent({
      runId,
      jobName: WEEKLY_REWARD_JOB_NAME,
      weekId,
      status: "COMPLETED",
      result
    });
    logger.info({ runId, weekId, result }, "Weekly reward payout completed");
  } catch (error) {
    await writeCronJobEvent({
      runId,
      jobName: WEEKLY_REWARD_JOB_NAME,
      weekId,
      status: "FAILED",
      error: serializeError(error)
    });
    logger.error({ runId, weekId, error }, "Weekly reward payout failed");
  }
}
