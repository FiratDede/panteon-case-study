import type { RankedScore } from "../../types/leaderboard";

export function getAroundRankWindow(entries: RankedScore[], currentRank: number, before = 3, after = 2) {
  const startRank = Math.max(1, currentRank - before);
  const endRank = currentRank + after;

  return entries.filter((entry) => entry.rank >= startRank && entry.rank <= endRank);
}
