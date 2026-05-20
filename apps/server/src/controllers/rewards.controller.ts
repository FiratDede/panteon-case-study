import type { Request, Response } from "express";
import { getCurrentWeekId } from "@panteon/shared";
import { finalizeWeek, getRewardHistory } from "../services/rewards.service";

export async function resetCurrentWeek(_request: Request, response: Response) {
  const result = await finalizeWeek(getCurrentWeekId());
  response.json(result);
}

export async function getHistory(request: Request, response: Response) {
  const weekId = typeof request.query.weekId === "string" ? request.query.weekId : undefined;
  const result = await getRewardHistory(weekId);
  response.json(result);
}
