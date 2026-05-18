import { mockLeaderboard } from "../mocks/leaderboard";
import type { LeaderboardResponse } from "../features/leaderboard/types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export async function fetchLeaderboard(playerName: string): Promise<LeaderboardResponse> {
  try {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/leaderboards/current?playerName=${encodeURIComponent(playerName)}`
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as LeaderboardResponse;
  } catch {
    return mockLeaderboard;
  }
}
