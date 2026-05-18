import { Router } from "express";
import { LeaderboardController } from "../controllers/leaderboard.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const controller = new LeaderboardController();

export const leaderboardRouter = Router();

leaderboardRouter.get("/api/v1/leaderboards/current", asyncHandler(controller.getCurrent));
leaderboardRouter.get("/api/v1/leaderboards/weeks/:weekId", asyncHandler(controller.getByWeek));
