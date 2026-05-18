import type { RankedScore } from "../types/leaderboard.js";

export type RewardAllocation = {
  playerId: string;
  rank: number;
  amount: bigint;
};

const BASIS_POINTS = 10_000n;

function percent(pool: bigint, basisPoints: bigint) {
  return (pool * basisPoints) / BASIS_POINTS;
}

export function calculateRewardAllocations(entries: RankedScore[], prizePool: bigint): RewardAllocation[] {
  if (prizePool <= 0n || entries.length === 0) {
    return entries.map((entry) => ({ playerId: entry.playerId, rank: entry.rank, amount: 0n }));
  }

  const top100 = entries.filter((entry) => entry.rank >= 1 && entry.rank <= 100);
  const allocations = new Map<string, RewardAllocation>();
  let allocated = 0n;

  const fixedRewards = new Map<number, bigint>([
    [1, percent(prizePool, 2_000n)],
    [2, percent(prizePool, 1_500n)],
    [3, percent(prizePool, 1_000n)]
  ]);

  for (const entry of top100) {
    const fixedAmount = fixedRewards.get(entry.rank);
    if (fixedAmount !== undefined) {
      allocations.set(entry.playerId, { playerId: entry.playerId, rank: entry.rank, amount: fixedAmount });
      allocated += fixedAmount;
    }
  }

  const weightedEntries = top100.filter((entry) => entry.rank >= 4 && entry.rank <= 100);
  const weightedPool = percent(prizePool, 5_500n);
  const totalWeight = weightedEntries.reduce((sum, entry) => sum + BigInt(101 - entry.rank), 0n);
  let weightedAllocated = 0n;

  if (totalWeight > 0n) {
    for (const entry of weightedEntries) {
      const weight = BigInt(101 - entry.rank);
      const amount = (weightedPool * weight) / totalWeight;
      allocations.set(entry.playerId, { playerId: entry.playerId, rank: entry.rank, amount });
      weightedAllocated += amount;
    }

    let remainder = weightedPool - weightedAllocated;
    for (const entry of weightedEntries.sort((a, b) => a.rank - b.rank)) {
      if (remainder <= 0n) {
        break;
      }

      const existing = allocations.get(entry.playerId);
      if (existing) {
        existing.amount += 1n;
        remainder -= 1n;
      }
    }
  }

  if (top100.length >= 100) {
    const totalAllocated = Array.from(allocations.values()).reduce((sum, allocation) => sum + allocation.amount, 0n);
    let remainder = prizePool - totalAllocated;

    for (const entry of top100.sort((a, b) => a.rank - b.rank)) {
      if (remainder <= 0n) {
        break;
      }

      const existing = allocations.get(entry.playerId);
      if (existing) {
        existing.amount += 1n;
        remainder -= 1n;
      }
    }
  }

  return top100.map((entry) => allocations.get(entry.playerId) ?? { playerId: entry.playerId, rank: entry.rank, amount: 0n });
}
