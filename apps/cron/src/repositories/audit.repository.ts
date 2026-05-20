import { getMongoDb } from "../db/mongo";

export type CronJobStatus = "STARTED" | "COMPLETED" | "FAILED";

export async function insertCronJobEvent(event: {
  runId: string;
  jobName: string;
  weekId: string;
  status: CronJobStatus;
  result?: unknown;
  error?: {
    name?: string;
    message: string;
    stack?: string;
  };
}) {
  await getMongoDb().collection("cron_job_events").insertOne({
    ...event,
    createdAt: new Date()
  });
}

export async function insertPayoutAudit(event: {
  weekId: string;
  playerId: number;
  rank: number;
  amount: string;
}) {
  await getMongoDb().collection("payout_audit_events").insertOne({
    ...event,
    createdAt: new Date()
  });
}
