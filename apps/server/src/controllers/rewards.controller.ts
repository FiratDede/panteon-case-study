import type { Request, Response } from "express";
import { finalizeWeek } from "../services/rewards.service.js";
import { getCurrentWeekId } from "../utils/week.js";

export async function resetCurrentWeek(_request: Request, response: Response) {
  const result = await finalizeWeek(getCurrentWeekId());
  response.json(result);
}
