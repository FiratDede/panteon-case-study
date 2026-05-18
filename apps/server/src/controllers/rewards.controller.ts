import type { Request, Response } from "express";
import { finalizeWeek } from "../services/rewards.service.js";
import { weekParamsSchema } from "../validators/leaderboard.validator.js";

export async function finalize(request: Request, response: Response) {
  const params = weekParamsSchema.parse(request.params);
  const result = await finalizeWeek(params.weekId);
  response.json(result);
}
