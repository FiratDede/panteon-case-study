export function getLeaderboardKey(weekId: string) {
  return `leaderboard:week:${weekId}`;
}

export function getPrizePoolKey(weekId: string) {
  return `leaderboard:week:${weekId}:pool`;
}
