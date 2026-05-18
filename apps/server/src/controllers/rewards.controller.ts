import type { Request, Response } from "express";
import { RewardsService } from "../services/rewards.service.js";
import { weekParamsSchema } from "../validators/leaderboard.validator.js";

export class RewardsController {
  constructor(private readonly service = new RewardsService()) {}

  finalize = async (request: Request, response: Response) => {
    const params = weekParamsSchema.parse(request.params);
    const result = await this.service.finalizeWeek(params.weekId);
    response.json(result);
  };
}
