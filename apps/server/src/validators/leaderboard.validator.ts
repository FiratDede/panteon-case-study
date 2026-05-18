import { z } from "zod";

export const leaderboardQuerySchema = z.object({
  playerName: z.string().min(1).max(64)
});

export const weekParamsSchema = z.object({
  weekId: z.string().min(1).max(32)
});
