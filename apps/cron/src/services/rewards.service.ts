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

    for (const score of topScores) {
      await tx.weeklyLeaderboardEntry.upsert({
        where: {
          weeklyLeaderboardId_playerId: {
            weeklyLeaderboardId: updatedWeek.id,
            playerId: score.playerId
          }
        },
        update: {
          rank: score.rank,
          score: score.score
        },
        create: {
          weeklyLeaderboardId: updatedWeek.id,
          playerId: score.playerId,
          rank: score.rank,
          score: score.score
        }
      });
    }

    for (const allocation of allocations) {
      const existingPayout = await tx.rewardPayout.findUnique({
        where: {
          weeklyLeaderboardId_playerId: {
            weeklyLeaderboardId: updatedWeek.id,
            playerId: allocation.playerId
          }
        }
      });

      if (existingPayout) {
        continue;
      }

      await tx.rewardPayout.create({
        data: {
          weeklyLeaderboardId: updatedWeek.id,
          playerId: allocation.playerId,
          rank: allocation.rank,
          amount: allocation.amount,
          status: "PAID",
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
