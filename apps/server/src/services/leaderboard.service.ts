import type { Player } from "@prisma/client";
import {
  ensureWeek,
  getPlayerRankedScore,
  getPrizePool,
  getRankWindow,
  getTopScores
} from "../repositories/leaderboard.repository.js";
import { findPlayerByName, findPlayersByIds } from "../repositories/player.repository.js";
import type { LeaderboardEntry, RankedScore } from "../types/leaderboard.js";
import { HttpError } from "../errors/http-error.js";
import { calculateRewardAllocations } from "../utils/rewards.js";
import { getCurrentWeekId, getTimeRemainingSeconds } from "../utils/week.js";

export function getCurrentLeaderboard(playerName: string) {
  return getLeaderboard(getCurrentWeekId(), playerName);
}

export async function getLeaderboard(weekId: string, playerName: string) {
  const player = await findPlayerByName(playerName);
  if (!player) {
    throw new HttpError(404, "Player not found");
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

async function getPlayerMap(playerIds: string[]) {
  const players = await findPlayersByIds([...new Set(playerIds)]);
  return new Map<string, Player>(players.map((player: Player) => [player.id, player]));
}

function toEntry(score: RankedScore, players: Map<string, Player>, rewards: Map<string, bigint>): LeaderboardEntry {
  const player = players.get(score.playerId);

  return {
    playerId: score.playerId,
    playerName: player?.playerName ?? score.playerId,
    rank: score.rank,
    score: score.score.toString(),
    projectedReward: (rewards.get(score.playerId) ?? 0n).toString()
  };
}

function dedupeScores(scores: RankedScore[]) {
  const map = new Map<string, RankedScore>();

  for (const score of scores) {
    map.set(score.playerId, score);
  }

  return Array.from(map.values());
}
