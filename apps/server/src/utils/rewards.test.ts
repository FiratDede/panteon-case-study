import { describe, expect, it } from "vitest";
import { calculateRewardAllocations } from "./rewards.js";
import type { RankedScore } from "../types/leaderboard.js";

function entries(count: number): RankedScore[] {
  return Array.from({ length: count }, (_, index) => ({
    playerId: `player-${index + 1}`,
    rank: index + 1,
    score: BigInt(1_000_000 - index)
  }));
}

describe("calculateRewardAllocations", () => {
  it("allocates the full pool across top 100 players", () => {
    const result = calculateRewardAllocations(entries(100), 1_000_000n);
    const total = result.reduce((sum, allocation) => sum + allocation.amount, 0n);

    expect(total).toBe(1_000_000n);
    expect(result[0]?.amount).toBe(200_000n);
    expect(result[1]?.amount).toBe(150_000n);
    expect(result[2]?.amount).toBe(100_000n);
    expect(result[3]!.amount > result[99]!.amount).toBe(true);
  });
});
