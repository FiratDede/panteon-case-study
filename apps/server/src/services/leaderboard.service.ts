import type { Player } from "@prisma/client";
import { env } from "../config/env.js";
import { LeaderboardRepository } from "../repositories/leaderboard.repository.js";
import { PlayerRepository } from "../repositories/player.repository.js";
import type { LeaderboardEntry, RankedScore } from "../types/leaderboard.js";
import { calculateRewardAllocations } from "../utils/rewards.js";
import { getTimeRemainingSeconds } from "../utils/week.js";
import { HttpError } from "../utils/http-error.js";

export class LeaderboardService {
  constructor(
    private readonly leaderboard = new LeaderboardRepository(),
    private readonly players = new PlayerRepository()
  ) {}

  async getCurrentLeaderboard(playerName: string) {
    return this.getLeaderboard(env.ACTIVE_WEEK_ID, playerName);
  }

  async getLeaderboard(weekId: string, playerName: string) {
    const player = await this.players.findByPlayerName(playerName);
    if (!player) {
      throw new HttpError(404, "Player not found");
    }

    const week = await this.leaderboard.ensureWeek(weekId);
    const [topScores, currentPlayerScore, prizePool] = await Promise.all([
      this.leaderboard.getTopScores(weekId, 100),
      this.leaderboard.getPlayerRankedScore(weekId, player.id),
      this.leaderboard.getPrizePool(weekId)
    ]);

    const rewardMap = new Map(
      calculateRewardAllocations(topScores, prizePool).map((allocation) => [allocation.playerId, allocation.amount])
    );

    const aroundScores =
      currentPlayerScore && currentPlayerScore.rank > 100
        ? await this.leaderboard.getRankWindow(weekId, currentPlayerScore.rank)
        : [];

    const allScores = dedupeScores([...topScores, ...(currentPlayerScore ? [currentPlayerScore] : []), ...aroundScores]);
    const playerMap = await this.getPlayerMap(allScores.map((score) => score.playerId));

    const top100 = topScores.map((score) => this.toEntry(score, playerMap, rewardMap));
    const currentPlayer = currentPlayerScore ? this.toEntry(currentPlayerScore, playerMap, rewardMap) : null;
    const aroundPlayer =
      currentPlayerScore && currentPlayerScore.rank > 100
        ? aroundScores.map((score) => this.toEntry(score, playerMap, rewardMap))
        : [];

    return {
      week: {
        id: week.weekId,
        startsAt: week.startsAt.toISOString(),
        endsAt: week.endsAt.toISOString(),
        status: week.status
      },
      prizePool: prizePool.toString(),
      timeRemainingSeconds: getTimeRemainingSeconds(week.endsAt),
      top100,
      currentPlayer,
      aroundPlayer,
      rewardRules: {
        first: "20%",
        second: "15%",
        third: "10%",
        fourthToHundredth: "55% weighted by rank"
      }
    };
  }

  private async getPlayerMap(playerIds: string[]) {
    const players = await this.players.findByIds([...new Set(playerIds)]);
    return new Map<string, Player>(players.map((player: Player) => [player.id, player]));
  }

  private toEntry(
    score: RankedScore,
    players: Map<string, Player>,
    rewards: Map<string, bigint>
  ): LeaderboardEntry {
    const player = players.get(score.playerId);

    return {
      playerId: score.playerId,
      playerName: player?.playerName ?? score.playerId,
      displayName: player?.displayName ?? score.playerId,
      avatarUrl: player?.avatarUrl ?? null,
      country: player?.country ?? null,
      rank: score.rank,
      score: score.score.toString(),
      projectedReward: (rewards.get(score.playerId) ?? 0n).toString()
    };
  }
}

function dedupeScores(scores: RankedScore[]) {
  const map = new Map<string, RankedScore>();

  for (const score of scores) {
    map.set(score.playerId, score);
  }

  return Array.from(map.values());
}
