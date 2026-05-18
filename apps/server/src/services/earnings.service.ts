import { createHash } from "node:crypto";
import { env } from "../config/env.js";
import { AuditRepository } from "../repositories/audit.repository.js";
import { IdempotencyRepository } from "../repositories/idempotency.repository.js";
import { LeaderboardRepository } from "../repositories/leaderboard.repository.js";
import { PlayerRepository } from "../repositories/player.repository.js";
import { HttpError } from "../utils/http-error.js";

export class EarningsService {
  constructor(
    private readonly players = new PlayerRepository(),
    private readonly leaderboard = new LeaderboardRepository(),
    private readonly idempotency = new IdempotencyRepository(),
    private readonly audit = new AuditRepository()
  ) {}

  async recordEarning(input: { playerName: string; amount: bigint; idempotencyKey: string; source: string }) {
    const weekId = env.ACTIVE_WEEK_ID;
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ ...input, amount: input.amount.toString(), weekId }))
      .digest("hex");

    const started = await this.idempotency.start("earn", input.idempotencyKey, requestHash);
    if (!started) {
      const existing = await this.idempotency.find("earn", input.idempotencyKey);
      if (existing?.status === "COMPLETED") {
        return existing.responseBody;
      }

      throw new HttpError(409, "Earning event is already being processed");
    }

    try {
      const player = await this.players.findByPlayerName(input.playerName);
      if (!player) {
        throw new HttpError(404, "Player not found");
      }

      await this.leaderboard.ensureWeek(weekId);
      const prizeContribution = (input.amount * 2n) / 100n;

      await this.leaderboard.incrementScore(weekId, player.id, input.amount);
      await this.leaderboard.incrementPrizePool(weekId, prizeContribution);
      await this.audit.insertEarningEvent({
        weekId,
        playerId: player.id,
        playerName: player.playerName,
        amount: input.amount.toString(),
        prizeContribution: prizeContribution.toString(),
        source: input.source,
        idempotencyKey: input.idempotencyKey
      });

      const response = {
        weekId,
        playerName: player.playerName,
        amount: input.amount.toString(),
        prizeContribution: prizeContribution.toString()
      };

      await this.idempotency.complete("earn", input.idempotencyKey, response);
      return response;
    } catch (error) {
      await this.idempotency.fail("earn", input.idempotencyKey);
      throw error;
    }
  }
}
