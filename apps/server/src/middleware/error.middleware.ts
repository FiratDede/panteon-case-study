import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { AppError } from "../common/errors/AppError";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        message: "Validation failed",
        details: error.flatten()
      }
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  logger.error({ error }, "Unhandled request error");
  response.status(500).json({
    error: {
      message: "Internal server error"
    }
  });
};
