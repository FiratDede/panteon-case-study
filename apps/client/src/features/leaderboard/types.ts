export type LeaderboardEntry = {
  playerId: string;
  playerName: string;
  rank: number;
  score: string;
  projectedReward: string;
};

export type LeaderboardResponse = {
  week: {
    id: string;
    startsAt: string;
    endsAt: string;
    status: string;
  };
  prizePool: string;
  timeRemainingSeconds: number;
  top100: LeaderboardEntry[];
  currentPlayer: LeaderboardEntry | null;
  aroundPlayer: LeaderboardEntry[];
  rewardRules: {
    first: string;
    second: string;
    third: string;
    fourthToHundredth: string;
  };
};
