import { prisma } from "../db/prisma";
import { redis } from "../db/redis";
import type { RankedScore } from "../types/leaderboard";
import { getLeaderboardDeltasKey, getLeaderboardKey, getPrizePoolKey } from "../common/utils/redis-keys";
import { getDefaultWeekWindow } from "../common/utils/week";

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

export async function incrementLeaderboardScore(weekId: string, playerId: number, amount: bigint) {
  const redisPlayerId = playerId.toString();
  await redis.zIncrBy(getLeaderboardKey(weekId), Number(amount), redisPlayerId);
  await redis.hIncrBy(getLeaderboardDeltasKey(weekId), redisPlayerId, Number(amount));
}

export async function incrementPrizePool(weekId: string, amount: bigint) {
  await redis.incrBy(getPrizePoolKey(weekId), Number(amount));
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

export async function flushDeltasToPostgres(weekId: string) {
  const deltas = await redis.hGetAll(getLeaderboardDeltasKey(weekId));
  const entries = Object.entries(deltas);

  for (const [redisPlayerId, delta] of entries) {
    const playerId = Number(redisPlayerId);
    await prisma.playerWeeklyScore.upsert({
      where: {
        weekId_playerId: { weekId, playerId }
      },
      update: {
        score: {
          increment: BigInt(delta)
        }
      },
      create: {
        weekId,
        playerId,
        score: BigInt(delta)
      }
    });

    await redis.hDel(getLeaderboardDeltasKey(weekId), redisPlayerId);
  }

  return entries.length;
}

export async function rebuildRedisFromPostgres(weekId: string) {
  const scores = await prisma.playerWeeklyScore.findMany({
    where: { weekId },
    select: { playerId: true, score: true }
  });

  if (scores.length === 0) {
    return 0;
  }

  await redis.del(getLeaderboardKey(weekId));
  await redis.zAdd(
    getLeaderboardKey(weekId),
    scores.map((score) => ({ value: score.playerId.toString(), score: Number(score.score) }))
  );

  return scores.length;
}
