import { z } from "zod";

export const earnEventSchema = z.object({
  playerName: z.string().min(1).max(64),
  amount: z.coerce.bigint().refine((value) => value > 0n, "amount must be positive"),
  idempotencyKey: z.string().min(8).max(128),
  source: z.string().min(1).max(64).default("gameplay")
});
