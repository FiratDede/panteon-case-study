export type LeaderboardEntry = {
  playerId: string;
  playerName: string;
  displayName: string;
  avatarUrl: string | null;
  country: string | null;
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
  playerId: string;
  rank: number;
  score: bigint;
};
