import { getMongoDb } from "../db/mongo";

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
