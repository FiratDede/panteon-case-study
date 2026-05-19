export type RewardWeek = {
  weekId: string;
  startsAt: string;
  endsAt: string;
  status: string;
};

export type RewardWinner = {
  playerId: number;
  playerName: string;
  rank: number;
  amount: string;
  status: string;
  paidAt: string | null;
};

export type RewardHistoryResponse = {
  weeks: RewardWeek[];
  selectedWeekId: string | null;
  selectedWeek: RewardWeek | null;
  winners: RewardWinner[];
};
