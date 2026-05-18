import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../lib/api";
import type { LeaderboardResponse } from "../types/leaderboard";

type State = {
  data: LeaderboardResponse | null;
  loading: boolean;
  error: string | null;
};

export function useLeaderboard(playerName: string) {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null
  });

  async function load() {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const data = await fetchLeaderboard(playerName);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load leaderboard"
      });
    }
  }

  useEffect(() => {
    void load();
  }, [playerName]);

  return { ...state, reload: load };
}
