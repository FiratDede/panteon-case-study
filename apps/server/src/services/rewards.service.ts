import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { insertPayoutAudit } from "../repositories/audit.repository";
import { ensureWeek, getPrizePool, getTopScores } from "../repositories/leaderboard.repository";
import { AppError } from "../common/errors/AppError";
import { calculateRewardAllocations } from "../common/utils/rewards";

export async function finalizeWeek(weekId: string) {
  console.log("Finalizing week:")
  const week = await ensureWeek(weekId);
  if (week.status === "FINALIZED") {
    return { weekId, status: "already_finalized" };
  }

  const [topScores, prizePool] = await Promise.all([getTopScores(weekId, 100), getPrizePool(weekId)]);

  if (topScores.length === 0) {
    throw new AppError(400, "Cannot finalize an empty leaderboard");
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

export async function getRewardHistory(weekId?: string) {
  const weeks = await prisma.weeklyLeaderboard.findMany({
    where: {
      payouts: {
        some: {}
      }
    },
    orderBy: {
      startsAt: "desc"
    },
    select: {
      id: true,
      weekId: true,
      startsAt: true,
      endsAt: true,
      status: true
    }
  });

  const selectedWeekId = weekId ?? weeks[0]?.weekId ?? null;

  if (!selectedWeekId) {
    return {
      weeks: [],
      selectedWeekId: null,
      winners: []
    };
  }

  const selectedWeek = weeks.find((week) => week.weekId === selectedWeekId);
  const payouts = await prisma.rewardPayout.findMany({
    where: {
      weeklyLeaderboard: {
        weekId: selectedWeekId
      }
    },
    orderBy: {
      rank: "asc"
    },
    include: {
      player: {
        select: {
          playerName: true
        }
      }
    }
  });

  return {
    weeks: weeks.map((week) => ({
      weekId: week.weekId,
      startsAt: week.startsAt.toISOString(),
      endsAt: week.endsAt.toISOString(),
      status: week.status
    })),
    selectedWeekId,
    selectedWeek: selectedWeek
      ? {
          weekId: selectedWeek.weekId,
          startsAt: selectedWeek.startsAt.toISOString(),
          endsAt: selectedWeek.endsAt.toISOString(),
          status: selectedWeek.status
        }
      : null,
    winners: payouts.map((payout) => ({
      playerId: payout.playerId,
      playerName: payout.player.playerName,
      rank: payout.rank,
      amount: payout.amount.toString(),
      status: payout.status,
      paidAt: payout.paidAt?.toISOString() ?? null
    }))
  };
}
