import { describe, expect, it } from "vitest";
import { getAroundRankWindow } from "../rank-window";
import type { RankedScore } from "../../../types/leaderboard";

const entries: RankedScore[] = Array.from({ length: 120 }, (_, index) => ({
  playerId: index + 1,
  rank: index + 1,
  score: BigInt(120 - index)
}));

describe("getAroundRankWindow", () => {
  it("returns three above and two below when available", () => {
    expect(getAroundRankWindow(entries, 105).map((entry) => entry.rank)).toEqual([102, 103, 104, 105, 106, 107]);
  });

  it("clamps near rank one", () => {
    expect(getAroundRankWindow(entries, 2).map((entry) => entry.rank)).toEqual([1, 2, 3, 4]);
  });
});
