import { getDefaultWeekWindow, getLeaderboardKey, getPrizePoolKey, type RankedScore } from "@panteon/shared";
import { prisma } from "../db/prisma";
import { redis } from "../db/redis";

export async function ensureWeek(weekId: string) {
  const { startsAt, endsAt } = getDefaultWeekWindow(weekId);

  return prisma.weeklyLeaderboard.upsert({
    where: { weekId },
    update: {},
    create: {
      weekId,
      startsAt,
      endsAt
    }
  });
}

export async function getPrizePool(weekId: string) {
  const value = await redis.get(getPrizePoolKey(weekId));
  return BigInt(value ?? 0);
}

export async function getTopScores(weekId: string, limit = 100): Promise<RankedScore[]> {
  const rows = await redis.zRangeWithScores(getLeaderboardKey(weekId), 0, limit - 1, { REV: true });

  return rows.map((row, index) => ({
    playerId: Number(row.value),
    rank: index + 1,
    score: BigInt(Math.trunc(row.score))
  }));
}

export async function getPlayerRankedScore(weekId: string, playerId: number): Promise<RankedScore | null> {
  const redisPlayerId = playerId.toString();
  const rank = await redis.zRevRank(getLeaderboardKey(weekId), redisPlayerId);
  if (rank === null) {
    return null;
  }

  const score = await redis.zScore(getLeaderboardKey(weekId), redisPlayerId);
  return {
    playerId,
    rank: rank + 1,
    score: BigInt(Math.trunc(score ?? 0))
  };
}

export async function getRankWindow(weekId: string, rank: number, before = 3, after = 2): Promise<RankedScore[]> {
  const start = Math.max(0, rank - before - 1);
  const end = rank + after - 1;
  const rows = await redis.zRangeWithScores(getLeaderboardKey(weekId), start, end, { REV: true });

  return rows.map((row, index) => ({
    playerId: Number(row.value),
    rank: start + index + 1,
    score: BigInt(Math.trunc(row.score))
  }));
}
