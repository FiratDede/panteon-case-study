import { Router } from "express";
import { getByWeek, getCurrent } from "../controllers/leaderboard.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const leaderboardRouter = Router();

leaderboardRouter.get("/weeks/current", asyncHandler(getCurrent));
leaderboardRouter.get("/weeks/:weekId", asyncHandler(getByWeek));
