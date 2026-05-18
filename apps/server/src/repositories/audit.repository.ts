import { getMongoDb } from "../db/mongo";

export async function insertEarningEvent(event: {
  weekId: string;
  playerId: number;
  playerName: string;
  amount: string;
  prizeContribution: string;
  source: string;
  idempotencyKey: string;
}) {
  await getMongoDb().collection("earning_events").insertOne({
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
