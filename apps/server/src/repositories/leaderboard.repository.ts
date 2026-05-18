import type { PrismaClient } from "@prisma/client";
import type { RedisClientType } from "redis";
import { prisma } from "../db/prisma.js";
import { redis } from "../db/redis.js";
import type { RankedScore } from "../types/leaderboard.js";
import { getDefaultWeekWindow } from "../utils/week.js";

function leaderboardKey(weekId: string) {
  return `leaderboard:week:${weekId}`;
}

function poolKey(weekId: string) {
  return `leaderboard:week:${weekId}:pool`;
}

function deltasKey(weekId: string) {
  return `leaderboard:week:${weekId}:deltas`;
}

export class LeaderboardRepository {
  constructor(
    private readonly db: PrismaClient = prisma,
    private readonly cache: RedisClientType = redis as RedisClientType
  ) {}

  async ensureWeek(weekId: string) {
    const { startsAt, endsAt } = getDefaultWeekWindow(weekId);

    return this.db.weeklyLeaderboard.upsert({
      where: { weekId },
      update: {},
      create: {
        weekId,
        startsAt,
        endsAt
      }
    });
  }

  async incrementScore(weekId: string, playerId: string, amount: bigint) {
    await this.cache.zIncrBy(leaderboardKey(weekId), Number(amount), playerId);
    await this.cache.hIncrBy(deltasKey(weekId), playerId, Number(amount));
  }

  async incrementPrizePool(weekId: string, amount: bigint) {
    await this.cache.incrBy(poolKey(weekId), Number(amount));
  }

  async getPrizePool(weekId: string) {
    const value = await this.cache.get(poolKey(weekId));
    return BigInt(value ?? 0);
  }

  async getTopScores(weekId: string, limit = 100): Promise<RankedScore[]> {
    const rows = await this.cache.zRangeWithScores(leaderboardKey(weekId), 0, limit - 1, { REV: true });

    return rows.map((row, index) => ({
      playerId: row.value,
      rank: index + 1,
      score: BigInt(Math.trunc(row.score))
    }));
  }

  async getPlayerRankedScore(weekId: string, playerId: string): Promise<RankedScore | null> {
    const rank = await this.cache.zRevRank(leaderboardKey(weekId), playerId);
    if (rank === null) {
      return null;
    }

    const score = await this.cache.zScore(leaderboardKey(weekId), playerId);
    return {
      playerId,
      rank: rank + 1,
      score: BigInt(Math.trunc(score ?? 0))
    };
  }

  async getRankWindow(weekId: string, rank: number, before = 3, after = 2): Promise<RankedScore[]> {
    const start = Math.max(0, rank - before - 1);
    const end = rank + after - 1;
    const rows = await this.cache.zRangeWithScores(leaderboardKey(weekId), start, end, { REV: true });

    return rows.map((row, index) => ({
      playerId: row.value,
      rank: start + index + 1,
      score: BigInt(Math.trunc(row.score))
    }));
  }

  async flushDeltasToPostgres(weekId: string) {
    const deltas = await this.cache.hGetAll(deltasKey(weekId));
    const entries = Object.entries(deltas);

    for (const [playerId, delta] of entries) {
      await this.db.playerWeeklyScore.upsert({
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

      await this.cache.hDel(deltasKey(weekId), playerId);
    }

    return entries.length;
  }

  async rebuildRedisFromPostgres(weekId: string) {
    const scores = await this.db.playerWeeklyScore.findMany({
      where: { weekId },
      select: { playerId: true, score: true }
    });

    if (scores.length === 0) {
      return 0;
    }

    await this.cache.del(leaderboardKey(weekId));
    await this.cache.zAdd(
      leaderboardKey(weekId),
      scores.map((score: { playerId: string; score: bigint }) => ({ value: score.playerId, score: Number(score.score) }))
    );

    return scores.length;
  }
}
