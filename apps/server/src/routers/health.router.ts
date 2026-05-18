import { Router } from "express";
import { HealthController } from "../controllers/health.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const controller = new HealthController();

export const healthRouter = Router();

healthRouter.get("/health", asyncHandler(controller.getHealth.bind(controller)));
