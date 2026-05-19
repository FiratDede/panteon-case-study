import { useEffect, useState } from "react";
import { fetchRewardHistory } from "../lib/api";
import type { RewardHistoryResponse } from "../types/rewards";

type State = {
  data: RewardHistoryResponse | null;
  loading: boolean;
  error: string | null;
};

export function useRewardHistory(weekId?: string) {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const data = await fetchRewardHistory(weekId);
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : "Failed to load reward history"
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [weekId]);

  return state;
}
