import type { LeaderboardResponse } from "../features/leaderboard/types";

const top100 = Array.from({ length: 100 }, (_, index) => ({
  playerId: `player-${index + 1}`,
  playerName: `player-${(index + 1).toString().padStart(3, "0")}`,
  displayName: `Player ${index + 1}`,
  avatarUrl: null,
  country: index % 3 === 0 ? "TR" : index % 3 === 1 ? "US" : "DE",
  rank: index + 1,
  score: String((150 - index) * 10000),
  projectedReward: index < 3 ? String([200000, 150000, 100000][index]) : String(Math.max(1000, 100000 - index * 800))
}));

export const mockLeaderboard: LeaderboardResponse = {
  week: {
    id: "2026-W21",
    startsAt: "2026-05-18T00:00:00.000Z",
    endsAt: "2026-05-25T00:00:00.000Z",
    status: "ACTIVE"
  },
  prizePool: "1000000",
  timeRemainingSeconds: 521000,
  top100,
  currentPlayer: {
    playerId: "player-120",
    playerName: "player-120",
    displayName: "Player 120",
    avatarUrl: null,
    country: "TR",
    rank: 120,
    score: "310000",
    projectedReward: "0"
  },
  aroundPlayer: [117, 118, 119, 120, 121, 122].map((rank) => ({
    playerId: `player-${rank}`,
    playerName: `player-${rank}`,
    displayName: `Player ${rank}`,
    avatarUrl: null,
    country: rank % 3 === 0 ? "TR" : rank % 3 === 1 ? "US" : "DE",
    rank,
    score: String((151 - rank) * 10000),
    projectedReward: "0"
  })),
  rewardRules: {
    first: "20%",
    second: "15%",
    third: "10%",
    fourthToHundredth: "55% weighted by rank"
  }
};
