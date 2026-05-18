import { Router } from "express";
import { getHealth } from "../controllers/health.controller";
import { asyncHandler } from "../common/utils/async-handler";

export const healthRouter = Router();

healthRouter.get("/", asyncHandler(getHealth));
