import { Router } from "express";
import { finalize } from "../controllers/rewards.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const rewardsRouter = Router();

rewardsRouter.post("/weeks/:weekId/finalize", asyncHandler(finalize));
