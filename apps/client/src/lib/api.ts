import type { LeaderboardResponse } from "../types/leaderboard";
import type { RewardHistoryResponse } from "../types/rewards";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchLeaderboard(playerName: string): Promise<LeaderboardResponse> {
  const response = await fetch(
    `${apiBaseUrl}/api/leaderboard/weeks/current?playerName=${encodeURIComponent(playerName)}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError("Player not found.", response.status);
    }

    throw new ApiError(`Leaderboard API returned ${response.status}`, response.status);
  }

  return (await response.json()) as LeaderboardResponse;
}

export async function fetchRewardHistory(weekId?: string): Promise<RewardHistoryResponse> {
  const query = weekId ? `?weekId=${encodeURIComponent(weekId)}` : "";
  const response = await fetch(`${apiBaseUrl}/api/leaderboard/weeks/rewards/history${query}`);

  if (!response.ok) {
    throw new ApiError(`Reward history API returned ${response.status}`, response.status);
  }

  return (await response.json()) as RewardHistoryResponse;
}
