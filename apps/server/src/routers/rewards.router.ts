import { Router } from "express";
import { RewardsController } from "../controllers/rewards.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const controller = new RewardsController();

export const rewardsRouter = Router();

rewardsRouter.post("/api/v1/admin/weeks/:weekId/finalize", asyncHandler(controller.finalize));
