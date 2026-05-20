import { prisma } from "../db/prisma";

export async function getRewardHistory(weekId?: string) {
  const weeks = await prisma.weeklyLeaderboard.findMany({
    where: {
      winners: {
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
      status: true,
      prizePool: true
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
  const winners = await prisma.weeklyLeaderboardWinner.findMany({
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
          status: selectedWeek.status,
          prizePool: selectedWeek.prizePool.toString()
        }
      : null,
    winners: winners.map((winner) => ({
      playerId: winner.playerId,
      playerName: winner.player.playerName,
      rank: winner.rank,
      amount: winner.rewardAmount.toString(),
      paidAt: winner.paidAt.toISOString()
    }))
  };
}
