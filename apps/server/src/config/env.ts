import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  MONGODB_URL: z.string().url().default("mongodb://localhost:27017"),
  MONGODB_DB: z.string().min(1).default("panteon_leaderboard"),
  ACTIVE_WEEK_ID: z.string().min(1).default("2026-W21")
});

export const env = envSchema.parse(process.env);
