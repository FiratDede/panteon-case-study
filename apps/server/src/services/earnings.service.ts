import { createHash } from "node:crypto";
import { getCurrentWeekId } from "@panteon/shared";
import { insertEarningEvent } from "../repositories/audit.repository";
import {
  completeIdempotencyKey,
  failIdempotencyKey,
  findIdempotencyKey,
  startIdempotencyKey
} from "../repositories/idempotency.repository";
import { ensureWeek, incrementLeaderboardScore, incrementPrizePool } from "../repositories/leaderboard.repository";
import { findPlayerByName } from "../repositories/player.repository";
import { AppError } from "../common/errors/AppError";

export async function recordEarning(input: {
  playerName: string;
  amount: bigint;
  idempotencyKey: string;
  source: string;
}) {
  const weekId = getCurrentWeekId();
  const requestHash = createHash("sha256")
    .update(JSON.stringify({ ...input, amount: input.amount.toString(), weekId }))
    .digest("hex");

  const started = await startIdempotencyKey("earn", input.idempotencyKey, requestHash);
  if (!started) {
    const existing = await findIdempotencyKey("earn", input.idempotencyKey);
    if (existing?.status === "COMPLETED") {
      return existing.responseBody;
    }

    throw new AppError(409, "Earning event is already being processed");
  }

  try {
    const player = await findPlayerByName(input.playerName);
    if (!player) {
      throw new AppError(404, "Player not found");
    }

    await ensureWeek(weekId);
    const prizeContribution = (input.amount * 2n) / 100n;

    await incrementLeaderboardScore(weekId, player.id, input.amount);
    await incrementPrizePool(weekId, prizeContribution);
    await insertEarningEvent({
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

    await completeIdempotencyKey("earn", input.idempotencyKey, response);
    return response;
  } catch (error) {
    await failIdempotencyKey("earn", input.idempotencyKey);
    throw error;
  }
}
