import { Router } from "express";
import { record } from "../controllers/earnings.controller.js";
import { getByWeek, getCurrent } from "../controllers/leaderboard.controller.js";
import { resetCurrentWeek } from "../controllers/rewards.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const leaderboardRouter = Router();

leaderboardRouter.get("/weeks/current", asyncHandler(getCurrent));
leaderboardRouter.get("/weeks/:weekId", asyncHandler(getByWeek));
leaderboardRouter.post("/earnings", asyncHandler(record));
leaderboardRouter.post("/weeks/reset", asyncHandler(resetCurrentWeek));
