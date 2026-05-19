import type { Player } from "@prisma/client";
import {
  ensureWeek,
  getPlayerRankedScore,
  getPrizePool,
  getRankWindow,
  getTopScores
} from "../repositories/leaderboard.repository";
import { findPlayerByName, findPlayersByIds } from "../repositories/player.repository";
import type { LeaderboardEntry, RankedScore } from "../types/leaderboard";
import { AppError } from "../common/errors/AppError";
import { calculateRewardAllocations } from "../common/utils/rewards";
import { getCurrentWeekId, getTimeRemainingSeconds } from "../common/utils/week";


export async function getLeaderboard(weekId: string, playerName: string) {
  const player = await findPlayerByName(playerName);
  if (!player) {
    throw new AppError(404, "Player not found");
  }

  const week = await ensureWeek(weekId);
  const [topScores, currentPlayerScore, prizePool] = await Promise.all([
    getTopScores(weekId, 100),
    getPlayerRankedScore(weekId, player.id),
    getPrizePool(weekId)
  ]);

  const rewardMap = new Map(
    calculateRewardAllocations(topScores, prizePool).map((allocation) => [allocation.playerId, allocation.amount])
  );

  const aroundScores =
    currentPlayerScore && currentPlayerScore.rank > 100 ? await getRankWindow(weekId, currentPlayerScore.rank) : [];

  const allScores = dedupeScores([...topScores, ...(currentPlayerScore ? [currentPlayerScore] : []), ...aroundScores]);
  const playerMap = await getPlayerMap(allScores.map((score) => score.playerId));

  const top100 = topScores.map((score) => toEntry(score, playerMap, rewardMap));
  const currentPlayer = currentPlayerScore ? toEntry(currentPlayerScore, playerMap, rewardMap) : null;
  const aroundPlayer =
    currentPlayerScore && currentPlayerScore.rank > 100
      ? aroundScores.map((score) => toEntry(score, playerMap, rewardMap))
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

async function getPlayerMap(playerIds: number[]) {
  const players = await findPlayersByIds([...new Set(playerIds)]);
  return new Map<number, Player>(players.map((player: Player) => [player.id, player]));
}

function toEntry(score: RankedScore, players: Map<number, Player>, rewards: Map<number, bigint>): LeaderboardEntry {
  const player = players.get(score.playerId);

  return {
    playerId: score.playerId,
    playerName: player?.playerName ?? score.playerId.toString(),
    rank: score.rank,
    score: score.score.toString(),
    projectedReward: (rewards.get(score.playerId) ?? 0n).toString()
  };
}

function dedupeScores(scores: RankedScore[]) {
  const map = new Map<number, RankedScore>();

  for (const score of scores) {
    map.set(score.playerId, score);
  }

  return Array.from(map.values());
}
