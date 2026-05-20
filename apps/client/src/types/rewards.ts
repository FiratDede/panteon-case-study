export type RewardWeek = {
  weekId: string;
  startsAt: string;
  endsAt: string;
  status: string;
  prizePool: BigInt;
};

export type RewardWinner = {
  playerId: number;
  playerName: string;
  rank: number;
  amount: string;
  paidAt: string;
};

export type RewardHistoryResponse = {
  weeks: RewardWeek[];
  selectedWeekId: string | null;
  selectedWeek: RewardWeek | null;
  winners: RewardWinner[];
};
