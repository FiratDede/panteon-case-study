import type { Request, Response } from "express";
import { recordEarning } from "../services/earnings.service.js";
import { earnEventSchema } from "../validators/earnings.validator.js";

export async function record(request: Request, response: Response) {
  const body = earnEventSchema.parse(request.body);
  const result = await recordEarning(body);
  response.status(202).json(result);
}
