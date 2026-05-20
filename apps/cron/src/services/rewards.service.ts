import type { Prisma } from "@prisma/client";
import { calculateRewardAllocations } from "@panteon/shared";
import { prisma } from "../db/prisma";
import { ensureWeek, getPrizePool, getTopScores } from "../repositories/leaderboard.repository";
import { insertPayoutAudit } from "../repositories/audit.repository";

export async function finalizeWeek(weekId: string) {
  const week = await ensureWeek(weekId);
  if (week.status === "FINALIZED") {
    return { weekId, status: "already_finalized" };
  }

  const [topScores, prizePool] = await Promise.all([getTopScores(weekId, 100), getPrizePool(weekId)]);

  if (topScores.length === 0) {
    throw new Error("Cannot finalize an empty leaderboard");
  }

  const allocations = calculateRewardAllocations(topScores, prizePool);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updatedWeek = await tx.weeklyLeaderboard.update({
      where: { weekId },
      data: {
        status: "FINALIZING",
        prizePool
      }
    });

    const scoreByPlayerId = new Map(topScores.map((score) => [score.playerId, score]));

    for (const allocation of allocations) {
      const score = scoreByPlayerId.get(allocation.playerId);
      if (!score) {
        continue;
      }

      const existingWinner = await tx.weeklyLeaderboardWinner.findUnique({
        where: {
          weeklyLeaderboardId_playerId: {
            weeklyLeaderboardId: updatedWeek.id,
            playerId: allocation.playerId
          }
        }
      });

      if (existingWinner) {
        continue;
      }

      await tx.weeklyLeaderboardWinner.create({
        data: {
          weeklyLeaderboardId: updatedWeek.id,
          playerId: allocation.playerId,
          rank: allocation.rank,
          score: score.score,
          rewardAmount: allocation.amount,
          paidAt: new Date()
        }
      });

      await tx.player.update({
        where: { id: allocation.playerId },
        data: {
          totalMoney: {
            increment: allocation.amount
          }
        }
      });
    }

    await tx.weeklyLeaderboard.update({
      where: { weekId },
      data: {
        status: "FINALIZED",
        finalizedAt: new Date()
      }
    });
  });

  await Promise.all(
    allocations.map((allocation) =>
      insertPayoutAudit({
        weekId,
        playerId: allocation.playerId,
        rank: allocation.rank,
        amount: allocation.amount.toString()
      })
    )
  );

  return {
    weekId,
    status: "finalized",
    paidPlayers: allocations.length,
    prizePool: prizePool.toString()
  };
}
