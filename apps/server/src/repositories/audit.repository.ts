import { getMongoDb } from "../db/mongo.js";

export class AuditRepository {
  async insertEarningEvent(event: {
    weekId: string;
    playerId: string;
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

  async insertPayoutAudit(event: {
    weekId: string;
    playerId: string;
    rank: number;
    amount: string;
  }) {
    await getMongoDb().collection("payout_audit_events").insertOne({
      ...event,
      createdAt: new Date()
    });
  }
}
