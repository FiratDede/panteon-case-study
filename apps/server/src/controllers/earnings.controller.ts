import type { Request, Response } from "express";
import { EarningsService } from "../services/earnings.service.js";
import { earnEventSchema } from "../validators/earnings.validator.js";

export class EarningsController {
  constructor(private readonly service = new EarningsService()) {}

  record = async (request: Request, response: Response) => {
    const body = earnEventSchema.parse(request.body);
    const result = await this.service.recordEarning(body);
    response.status(202).json(result);
  };
}
