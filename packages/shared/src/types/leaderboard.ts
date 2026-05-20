export type LeaderboardEntry = {
  playerId: number;
  playerName: string;
  rank: number;
  score: string;
  projectedReward: string;
};

export type CurrentPlayerRank = LeaderboardEntry | null;

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
  currentPlayer: CurrentPlayerRank;
  aroundPlayer: LeaderboardEntry[];
  rewardRules: {
    first: string;
    second: string;
    third: string;
    fourthToHundredth: string;
  };
};

export type RankedScore = {
  playerId: number;
  rank: number;
  score: bigint;
};
