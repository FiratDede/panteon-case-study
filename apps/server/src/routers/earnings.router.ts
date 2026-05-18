import { Router } from "express";
import { record } from "../controllers/earnings.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const earningsRouter = Router();

earningsRouter.post("/earn", asyncHandler(record));
