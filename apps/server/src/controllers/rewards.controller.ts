import type { Request, Response } from "express";
import { getRewardHistory } from "../services/rewards.service";

export async function getHistory(request: Request, response: Response) {
  const weekId = typeof request.query.weekId === "string" ? request.query.weekId : undefined;
  const result = await getRewardHistory(weekId);
  response.json(result);
}
