import { Router } from "express";
import { EarningsController } from "../controllers/earnings.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const controller = new EarningsController();

export const earningsRouter = Router();

earningsRouter.post("/api/v1/events/earn", asyncHandler(controller.record));
