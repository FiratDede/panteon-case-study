export type LeaderboardEntry = {
  playerId: number;
  playerName: string;
  rank: number;
  score: string;
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
};
