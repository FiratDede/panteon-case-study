import type { Request, Response } from "express";
import { getCurrentWeekId } from "@panteon/shared";
import {  getLeaderboard } from "../services/leaderboard.service";
import { leaderboardQuerySchema, weekParamsSchema } from "../validators/leaderboard.validator";

export async function getCurrent(request: Request, response: Response) {
  const query = leaderboardQuerySchema.parse(request.query);
  const result = await getLeaderboard(getCurrentWeekId(),query.playerName);
  response.json(result);
}

export async function getByWeek(request: Request, response: Response) {
  const query = leaderboardQuerySchema.parse(request.query);
  const params = weekParamsSchema.parse(request.params);
  const result = await getLeaderboard(params.weekId, query.playerName);
  response.json(result);
}
