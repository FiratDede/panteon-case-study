import type { Request, Response } from "express";
import { LeaderboardService } from "../services/leaderboard.service.js";
import { leaderboardQuerySchema, weekParamsSchema } from "../validators/leaderboard.validator.js";

export class LeaderboardController {
  constructor(private readonly service = new LeaderboardService()) {}

  getCurrent = async (request: Request, response: Response) => {
    const query = leaderboardQuerySchema.parse(request.query);
    const result = await this.service.getCurrentLeaderboard(query.playerName);
    response.json(result);
  };

  getByWeek = async (request: Request, response: Response) => {
    const query = leaderboardQuerySchema.parse(request.query);
    const params = weekParamsSchema.parse(request.params);
    const result = await this.service.getLeaderboard(params.weekId, query.playerName);
    response.json(result);
  };
}
