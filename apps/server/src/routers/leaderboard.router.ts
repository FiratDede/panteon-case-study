import { Router } from "express";
import { getByWeek, getCurrent } from "../controllers/leaderboard.controller";
import { getHistory } from "../controllers/rewards.controller";
import { asyncHandler } from "../common/utils/async-handler";

export const leaderboardRouter = Router();

leaderboardRouter.get("/weeks/current", asyncHandler(getCurrent));
leaderboardRouter.get("/weeks/rewards/history", asyncHandler(getHistory));
leaderboardRouter.get("/weeks/:weekId", asyncHandler(getByWeek));
