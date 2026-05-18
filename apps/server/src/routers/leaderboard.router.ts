import { Router } from "express";
import { record } from "../controllers/earnings.controller";
import { getByWeek, getCurrent } from "../controllers/leaderboard.controller";
import { resetCurrentWeek } from "../controllers/rewards.controller";
import { asyncHandler } from "../common/utils/async-handler";

export const leaderboardRouter = Router();

leaderboardRouter.get("/weeks/current", asyncHandler(getCurrent));
leaderboardRouter.get("/weeks/:weekId", asyncHandler(getByWeek));
leaderboardRouter.post("/earnings", asyncHandler(record));
leaderboardRouter.post("/weeks/reset", asyncHandler(resetCurrentWeek));
