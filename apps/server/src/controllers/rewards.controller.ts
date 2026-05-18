import type { Request, Response } from "express";
import { finalizeWeek } from "../services/rewards.service";
import { getCurrentWeekId } from "../common/utils/week";

export async function resetCurrentWeek(_request: Request, response: Response) {
  const result = await finalizeWeek(getCurrentWeekId());
  response.json(result);
}
